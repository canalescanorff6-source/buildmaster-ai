import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { compareSchema } from '@/lib/validators';
import { compareCards } from '@/lib/pri-engine';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const input = compareSchema.parse(await request.json());
    const cards = await prisma.card.findMany({
      where: { id: { in: input.cardIds } },
      include: { player: true, attributes: true, abilities: { include: { ability: true } } }
    });

    if (cards.length < 2) {
      return NextResponse.json({ message: 'Escolha pelo menos duas cartas válidas.' }, { status: 400 });
    }

    const result = compareCards(cards, input.targetPosition);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível comparar as cartas.', error: String(error) }, { status: 400 });
  }
}
