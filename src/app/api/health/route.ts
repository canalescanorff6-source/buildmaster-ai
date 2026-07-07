import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function safeCheck(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const tables = await Promise.all([
      safeCheck('User', () => prisma.user.count()),
      safeCheck('Player', () => prisma.player.count()),
      safeCheck('Card', () => prisma.card.count()),
      safeCheck('Build', () => prisma.build.count()),
      safeCheck('RecommendationLog', () => prisma.recommendationLog.count())
    ]);

    return NextResponse.json({
      ok: tables.every((item) => item.ok),
      app: process.env.NEXT_PUBLIC_APP_NAME ?? 'BuildMaster AI',
      database: 'connected',
      latencyMs: Date.now() - startedAt,
      tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        app: process.env.NEXT_PUBLIC_APP_NAME ?? 'BuildMaster AI',
        database: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
