export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { CompareClient } from '@/components/compare-client';

export default async function ComparadorPage() {
  const cards = await prisma.card.findMany({ orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }], include: { player: true } });
  const options = cards.map((card) => ({ id: card.id, label: `${card.player.name} - ${card.name}`, position: card.positions ?? card.player.mainPosition, maxOverall: card.maxOverall, overall: card.overall }));
  return <CompareClient cards={options} />;
}
