import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cardSchema } from '@/lib/validators';
import { buildRecommendation } from '@/lib/pri-engine';

type Params = { params: Promise<{ id: string }> };

const include = {
  player: true,
  attributes: true,
  abilities: { include: { ability: true } },
  builds: { orderBy: { createdAt: 'desc' } as const }
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id }, include });
  if (!card) return NextResponse.json({ message: 'Carta não encontrada.' }, { status: 404 });
  return NextResponse.json({ card, recommendation: buildRecommendation(card, 'COMPETITIVE', 'AUTO') });
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const { id } = await params;
    const parsed = cardSchema.parse(await request.json());
    const { attributes, ...data } = parsed;
    const card = await prisma.card.update({
      where: { id },
      data: {
        ...data,
        attributes: attributes ? { upsert: { create: attributes, update: attributes } } : undefined
      },
      include
    });
    return NextResponse.json({ card });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível atualizar a carta.', error: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.card.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível excluir a carta.', error: String(error) }, { status: 400 });
  }
}
