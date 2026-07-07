import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cardSchema } from '@/lib/validators';

const cardInclude = {
  player: true,
  attributes: true,
  abilities: { include: { ability: true } }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const rarity = searchParams.get('rarity') ?? '';
  const position = searchParams.get('position') ?? '';

  const cards = await prisma.card.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { player: { name: { contains: q, mode: 'insensitive' } } }
              ]
            }
          : {},
        rarity ? { rarity: rarity as never } : {},
        position
          ? {
              OR: [
                { positions: { contains: position, mode: 'insensitive' } },
                { player: { mainPosition: { equals: position, mode: 'insensitive' } } }
              ]
            }
          : {}
      ]
    },
    include: cardInclude,
    orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }]
  });

  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const parsed = cardSchema.parse(await request.json());
    const { attributes, ...data } = parsed;
    const card = await prisma.card.create({
      data: {
        ...data,
        attributes: { create: attributes ?? {} }
      },
      include: cardInclude
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível criar a carta.', error: String(error) }, { status: 400 });
  }
}
