import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buildRequestSchema } from '@/lib/validators';
import { buildRecommendation } from '@/lib/pri-engine';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const input = buildRequestSchema.parse(await request.json());
    const card = await prisma.card.findUnique({
      where: { id: input.cardId },
      include: { player: true, attributes: true, abilities: { include: { ability: true } } }
    });

    if (!card) return NextResponse.json({ message: 'Carta não encontrada.' }, { status: 404 });

    const result = buildRecommendation(card, input.objective, input.targetPosition);

    await prisma.recommendationLog.create({
      data: { userId: user.id, input, result: result as never }
    });

    let build = null;
    if (input.save) {
      build = await prisma.build.create({
        data: {
          cardId: card.id,
          userId: user.id,
          name: `${card.player.name} ${result.recommendedPosition} - ${input.objective}`,
          objective: input.objective,
          targetPosition: result.recommendedPosition,
          shooting: result.training.shooting ?? 0,
          passing: result.training.passing ?? 0,
          dribbling: result.training.dribbling ?? 0,
          dexterity: result.training.dexterity ?? 0,
          lowerBodyStrength: result.training.lowerBodyStrength ?? 0,
          aerialStrength: result.training.aerialStrength ?? 0,
          defending: result.training.defending ?? 0,
          gk1: result.training.gk1 ?? 0,
          gk2: result.training.gk2 ?? 0,
          gk3: result.training.gk3 ?? 0,
          priOverall: result.pri.overall,
          scores: result.pri as never,
          recommendedSkills: result.recommendedSkills.join(', '),
          tacticalFit: result.tacticalFit as never,
          notes: result.usageTips.join('\n')
        }
      });
    }

    return NextResponse.json({ result, build });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível gerar a build.', error: String(error) }, { status: 400 });
  }
}
