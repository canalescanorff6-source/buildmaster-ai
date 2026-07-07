export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { CardManager } from '@/components/card-manager';

export default async function CartasPage() {
  const [cards, players] = await Promise.all([
    prisma.card.findMany({ orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }], include: { player: true, attributes: true } }),
    prisma.player.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, mainPosition: true } })
  ]);

  const cardRows = cards.map((card) => ({
    id: card.id,
    playerId: card.playerId,
    playerName: card.player.name,
    name: card.name,
    rarity: card.rarity,
    overall: card.overall,
    maxOverall: card.maxOverall,
    playstyle: card.playstyle,
    season: card.season,
    positions: card.positions,
    attributes: card.attributes
      ? {
          offensiveAwareness: card.attributes.offensiveAwareness,
          ballControl: card.attributes.ballControl,
          dribbling: card.attributes.dribbling,
          tightPossession: card.attributes.tightPossession,
          lowPass: card.attributes.lowPass,
          loftedPass: card.attributes.loftedPass,
          finishing: card.attributes.finishing,
          heading: card.attributes.heading,
          placeKicking: card.attributes.placeKicking,
          curl: card.attributes.curl,
          speed: card.attributes.speed,
          acceleration: card.attributes.acceleration,
          kickingPower: card.attributes.kickingPower,
          jump: card.attributes.jump,
          physicalContact: card.attributes.physicalContact,
          balance: card.attributes.balance,
          stamina: card.attributes.stamina,
          defensiveAwareness: card.attributes.defensiveAwareness,
          tackling: card.attributes.tackling,
          aggression: card.attributes.aggression,
          defensiveEngagement: card.attributes.defensiveEngagement,
          goalkeeperAwareness: card.attributes.goalkeeperAwareness,
          goalkeeperCatching: card.attributes.goalkeeperCatching,
          goalkeeperParrying: card.attributes.goalkeeperParrying,
          goalkeeperReflexes: card.attributes.goalkeeperReflexes,
          goalkeeperReach: card.attributes.goalkeeperReach
        }
      : null
  }));

  return <CardManager cards={cardRows} players={players} />;
}
