export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/stat-card';
import { calculatePRI, getBestPosition } from '@/lib/pri-engine';

export default async function DashboardPage() {
  const [players, cards, builds, recommendations, topCards] = await Promise.all([
    prisma.player.count(),
    prisma.card.count(),
    prisma.build.count(),
    prisma.recommendationLog.count(),
    prisma.card.findMany({
      take: 6,
      orderBy: [{ maxOverall: 'desc' }, { overall: 'desc' }],
      include: { player: true, attributes: true, abilities: { include: { ability: true } } }
    })
  ]);

  return (
    <div className="grid">
      <section className="grid stats">
        <StatCard label="Jogadores" value={players} hint="Base própria cadastrada" />
        <StatCard label="Cartas" value={cards} hint="Cartas prontas para PRI" />
        <StatCard label="Builds" value={builds} hint="Builds salvas pela IA" />
        <StatCard label="Análises" value={recommendations} hint="Logs do motor inteligente" />
      </section>

      <section className="grid two">
        <article className="card page-panel">
          <div className="section-title">
            <div><h2>Top cartas por PRI</h2><p className="muted">O ranking considera atributos, habilidades e melhor posição real.</p></div>
            <Link className="button secondary small" href="/dashboard/recomendacoes">Gerar build</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Jogador</th><th>Posição real</th><th>OVR</th><th>PRI</th></tr></thead>
              <tbody>
                {topCards.map((card) => {
                  const position = getBestPosition(card);
                  const pri = calculatePRI(card, position);
                  return (
                    <tr key={card.id}>
                      <td><strong>{card.player.name}</strong><div className="muted mini">{card.name} • {card.rarity}</div></td>
                      <td><span className="badge">{position}</span></td>
                      <td>{card.maxOverall ?? card.overall}</td>
                      <td><strong>{pri.overall.toFixed(1)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card page-panel premium-panel">
          <span className="badge">MVP Completo</span>
          <h2>O diferencial do BuildMaster</h2>
          <p className="muted">A plataforma não tenta apenas maximizar overall. Ela mede rendimento real com PRI, melhor posição, compatibilidade tática e habilidades adicionais.</p>
          <div className="feature-list">
            <div><strong>PRI</strong><span>Nota real por função.</span></div>
            <div><strong>Build AI</strong><span>Pontos de treino por objetivo.</span></div>
            <div><strong>Comparador</strong><span>Decisão entre versões da carta.</span></div>
            <div><strong>Importação</strong><span>Base própria com JSON.</span></div>
          </div>
        </article>
      </section>
    </div>
  );
}
