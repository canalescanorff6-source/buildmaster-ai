import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { playerSchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const position = searchParams.get('position') ?? '';

  const players = await prisma.player.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { club: { contains: q, mode: 'insensitive' } },
                { country: { contains: q, mode: 'insensitive' } }
              ]
            }
          : {},
        position ? { mainPosition: { equals: position, mode: 'insensitive' } } : {}
      ]
    },
    include: { cards: true },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ players });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const data = playerSchema.parse(await request.json());
    const player = await prisma.player.create({ data });
    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível criar o jogador.', error: String(error) }, { status: 400 });
  }
}
