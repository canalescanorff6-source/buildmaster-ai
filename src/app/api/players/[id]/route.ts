import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { playerSchema } from '@/lib/validators';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const player = await prisma.player.findUnique({ where: { id }, include: { cards: { include: { attributes: true } } } });
  if (!player) return NextResponse.json({ message: 'Jogador não encontrado.' }, { status: 404 });
  return NextResponse.json({ player });
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const { id } = await params;
    const data = playerSchema.parse(await request.json());
    const player = await prisma.player.update({ where: { id }, data });
    return NextResponse.json({ player });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível atualizar o jogador.', error: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível excluir o jogador.', error: String(error) }, { status: 400 });
  }
}
