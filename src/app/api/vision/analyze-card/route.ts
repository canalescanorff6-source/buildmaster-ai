import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { buildRecommendation, compareCards } from '@/lib/pri-engine';
import { parseCardImageText } from '@/lib/vision/card-identity';
import { createTemporaryCardFromImage } from '@/lib/vision/temp-card';
import { toPtBrPositions } from '@/lib/positions';

const requestSchema = z.object({
  rawText: z.string().default(''),
  imageFileName: z.string().optional().nullable(),
  objective: z.enum(['COMPETITIVE', 'MAX_OVERALL', 'FINISHER', 'CREATOR', 'DRIBBLER', 'PRESSING', 'POSSESSION', 'QUICK_COUNTER', 'DEFENSIVE', 'AERIAL']).default('COMPETITIVE'),
  targetPosition: z.string().default('AUTO'),
  formation: z.string().default('4-2-2-2'),
  teamStyle: z.string().default('Quick Counter')
});

async function findMatchingCards(parsed: ReturnType<typeof parseCardImageText>) {
  const nameParts = parsed.playerName.split(/\s+/).filter((part) => part.length > 2);
  const mainSearch = nameParts.length ? nameParts[nameParts.length - 1] : parsed.playerName;

  return prisma.card.findMany({
    where: {
      AND: [
        { player: { name: { contains: mainSearch, mode: 'insensitive' } } },
        parsed.rarity ? { rarity: parsed.rarity } : {},
        parsed.maxOverall ? { OR: [{ maxOverall: parsed.maxOverall }, { overall: parsed.maxOverall }] } : {}
      ]
    },
    include: { player: true, attributes: true, abilities: { include: { ability: true } } },
    orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }],
    take: 5
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = requestSchema.parse(body);
    const parsed = parseCardImageText(input.rawText, input.imageFileName);
    const matches = await findMatchingCards(parsed);
    const sourceCard = matches[0] ?? createTemporaryCardFromImage(parsed);
    const recommendation = buildRecommendation(sourceCard, input.objective, input.targetPosition);
    const comparison = matches.length > 1 ? compareCards(matches, input.targetPosition) : null;

    return NextResponse.json({
      parsed,
      matched: matches.length > 0,
      matchedCards: matches.map((card) => ({
        id: card.id,
        playerName: card.player.name,
        cardName: card.name,
        rarity: card.rarity,
        positions: card.positions ?? card.player.mainPosition,
        positionsPt: toPtBrPositions(card.positions ?? card.player.mainPosition),
        overall: card.overall,
        maxOverall: card.maxOverall
      })),
      recommendation,
      comparison,
      note: matches.length
        ? 'A carta foi encontrada na sua base e a recomendação usou os atributos cadastrados.'
        : Object.keys(parsed.parsedAttributes).length > 0
          ? 'A carta não foi encontrada na base. A recomendação foi gerada pela imagem usando os atributos lidos do print.'
          : 'A carta não foi encontrada na base. A recomendação foi gerada com leitura da imagem e atributos estimados pela posição/overall.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível analisar a imagem da carta.' },
      { status: 400 }
    );
  }
}
