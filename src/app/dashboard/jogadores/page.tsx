export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { PlayerManager } from '@/components/player-manager';

export default async function JogadoresPage() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { cards: true } } } });
  const rows = players.map((player) => ({
    id: player.id,
    name: player.name,
    club: player.club,
    country: player.country,
    mainPosition: player.mainPosition,
    secondaryPositions: player.secondaryPositions,
    playstyle: player.playstyle,
    height: player.height,
    weight: player.weight,
    age: player.age,
    dominantFoot: player.dominantFoot,
    cardsCount: player._count.cards
  }));
  return <PlayerManager players={rows} />;
}
