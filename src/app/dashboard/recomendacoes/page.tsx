export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { BuildGenerator } from '@/components/build-generator';

export default async function RecomendacoesPage() {
  const cards = await prisma.card.findMany({ orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }], include: { player: true } });
  const options = cards.map((card) => ({ id: card.id, label: `${card.player.name} - ${card.name}`, position: card.positions ?? card.player.mainPosition, maxOverall: card.maxOverall, overall: card.overall }));
  return <BuildGenerator cards={options} />;
}
