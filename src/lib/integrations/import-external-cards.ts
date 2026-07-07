import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { externalCardSchema, type ExternalCardInput } from './external-card-schema';
import { cardDisplayName, joinField, safeExternalPlayerId } from './normalizer';
import { hashJson } from './hash';

type ImportOptions = {
  sourceName: string;
  sourceKind?: 'AUTHORIZED_JSON_FEED' | 'AUTHORIZED_API' | 'USER_UPLOAD' | 'PARTNER_LICENSE';
  sourceBaseUrl?: string | null;
  documentationUrl?: string | null;
  termsAccepted?: boolean;
};

export type ImportResult = {
  sourceName: string;
  totalRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: Array<{ index: number; message: string }>;
  jobId: string;
};

async function getOrCreateSource(options: ImportOptions) {
  return prisma.dataSource.upsert({
    where: { name: options.sourceName },
    update: {
      kind: options.sourceKind ?? 'AUTHORIZED_JSON_FEED',
      baseUrl: options.sourceBaseUrl ?? undefined,
      documentationUrl: options.documentationUrl ?? undefined,
      termsAcceptedByUserAt: options.termsAccepted ? new Date() : undefined
    },
    create: {
      name: options.sourceName,
      kind: options.sourceKind ?? 'AUTHORIZED_JSON_FEED',
      baseUrl: options.sourceBaseUrl ?? null,
      documentationUrl: options.documentationUrl ?? null,
      termsAcceptedByUserAt: options.termsAccepted ? new Date() : null
    }
  });
}

async function upsertSkill(name: string, category: 'GENERAL' | 'FINISHING' | 'DRIBBLING' | 'PASSING' | 'DEFENDING' | 'PHYSICAL' = 'GENERAL') {
  return prisma.ability.upsert({
    where: { name },
    update: {},
    create: { name, category }
  });
}

export async function importExternalCards(rows: unknown[], options: ImportOptions): Promise<ImportResult> {
  const source = await getOrCreateSource(options);
  const job = await prisma.syncJob.create({
    data: { sourceId: source.id, status: 'RUNNING', startedAt: new Date(), totalRows: rows.length }
  });

  let createdRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;
  const errors: ImportResult['errors'] = [];

  for (let index = 0; index < rows.length; index++) {
    const raw = rows[index];
    const parsed = externalCardSchema.safeParse(raw);
    if (!parsed.success) {
      skippedRows += 1;
      errors.push({ index, message: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') });
      continue;
    }

    const row: ExternalCardInput = parsed.data;
    const rawHash = hashJson(row);

    try {
      const playerExternalId = safeExternalPlayerId(row);
      const playerMap = await prisma.externalPlayerMap.findUnique({
        where: { sourceId_externalId: { sourceId: source.id, externalId: playerExternalId } },
        include: { player: true }
      });

      const playerData = {
        externalId: playerExternalId,
        name: row.playerName,
        club: row.club ?? null,
        country: row.country ?? null,
        mainPosition: row.mainPosition,
        secondaryPositions: joinField(row.secondaryPositions),
        playstyle: row.playerPlaystyle ?? null,
        height: row.height ?? null,
        weight: row.weight ?? null,
        age: row.age ?? null,
        dominantFoot: row.dominantFoot
      };

      let player = playerMap?.player;
      if (player) {
        player = await prisma.player.update({ where: { id: player.id }, data: playerData });
        await prisma.externalPlayerMap.update({
          where: { sourceId_externalId: { sourceId: source.id, externalId: playerExternalId } },
          data: { raw: row, rawHash, syncedAt: new Date() }
        });
      } else {
        player = await prisma.player.upsert({
          where: { externalId: playerExternalId },
          update: playerData,
          create: playerData
        });
        await prisma.externalPlayerMap.upsert({
          where: { sourceId_externalId: { sourceId: source.id, externalId: playerExternalId } },
          update: { playerId: player.id, raw: row, rawHash, syncedAt: new Date() },
          create: { sourceId: source.id, externalId: playerExternalId, playerId: player.id, raw: row, rawHash }
        });
      }

      const existingCardMap = await prisma.externalCardMap.findUnique({
        where: { sourceId_externalId: { sourceId: source.id, externalId: row.sourceExternalId } },
        include: { card: true }
      });

      const cardData = {
        name: cardDisplayName(row),
        season: row.season ?? null,
        rarity: row.rarity,
        overall: row.overall,
        maxOverall: row.maxOverall ?? null,
        playstyle: row.cardPlaystyle ?? row.playerPlaystyle ?? null,
        imageUrl: row.imageUrl || null,
        positions: joinField(row.positions),
        releaseDate: row.releaseDate ? new Date(row.releaseDate) : null
      };

      const attributeData = row.attributes;
      let cardId: string;
      if (existingCardMap?.card) {
        const updateData: Prisma.CardUpdateInput = {
          ...cardData,
          ...(attributeData
            ? {
                attributes: {
                  upsert: {
                    create: attributeData,
                    update: attributeData
                  }
                }
              }
            : {})
        };

        const card = await prisma.card.update({
          where: { id: existingCardMap.card.id },
          data: updateData
        });
        cardId = card.id;
        updatedRows += 1;
      } else {
        const createData: Prisma.CardCreateInput = {
          player: { connect: { id: player.id } },
          name: cardData.name,
          season: cardData.season,
          rarity: cardData.rarity,
          overall: cardData.overall,
          maxOverall: cardData.maxOverall,
          playstyle: cardData.playstyle,
          imageUrl: cardData.imageUrl,
          positions: cardData.positions,
          releaseDate: cardData.releaseDate,
          ...(attributeData ? { attributes: { create: attributeData } } : {})
        };

        const card = await prisma.card.create({ data: createData });
        cardId = card.id;
        await prisma.externalCardMap.create({
          data: { sourceId: source.id, externalId: row.sourceExternalId, cardId, raw: row, rawHash }
        });
        createdRows += 1;
      }

      await prisma.externalCardMap.update({
        where: { sourceId_externalId: { sourceId: source.id, externalId: row.sourceExternalId } },
        data: { cardId, raw: row, rawHash, syncedAt: new Date() }
      });

      for (const skillName of row.nativeSkills) {
        const ability = await upsertSkill(skillName.trim());
        await prisma.cardAbility.upsert({
          where: { cardId_abilityId_type: { cardId, abilityId: ability.id, type: 'NATIVE' } },
          update: {},
          create: { cardId, abilityId: ability.id, type: 'NATIVE' }
        });
      }

      for (const skillName of row.recommendedSkills) {
        const ability = await upsertSkill(skillName.trim());
        await prisma.cardAbility.upsert({
          where: { cardId_abilityId_type: { cardId, abilityId: ability.id, type: 'RECOMMENDED' } },
          update: {},
          create: { cardId, abilityId: ability.id, type: 'RECOMMENDED' }
        });
      }
    } catch (error) {
      skippedRows += 1;
      errors.push({ index, message: String(error) });
    }
  }

  await prisma.dataSource.update({ where: { id: source.id }, data: { lastSyncedAt: new Date() } });
  await prisma.syncJob.update({
    where: { id: job.id },
    data: {
      status: errors.length === rows.length && rows.length > 0 ? 'FAILED' : 'SUCCESS',
      finishedAt: new Date(),
      createdRows,
      updatedRows,
      skippedRows,
      error: errors.length ? JSON.stringify(errors.slice(0, 20)) : null
    }
  });

  return {
    sourceName: source.name,
    totalRows: rows.length,
    createdRows,
    updatedRows,
    skippedRows,
    errors,
    jobId: job.id
  };
}
