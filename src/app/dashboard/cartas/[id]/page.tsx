import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { buildRecommendation } from '@/lib/pri-engine';
import { PriMeter } from '@/components/pri-meter';
import { toPtBrPosition, toPtBrPositions } from '@/lib/positions';

type PageProps = { params: Promise<{ id: string }> };

export default async function CartaDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id },
    include: { player: true, attributes: true, abilities: { include: { ability: true } }, builds: { orderBy: { createdAt: 'desc' }, take: 5 } }
  });

  if (!card) notFound();

  const result = buildRecommendation(card, 'COMPETITIVE', 'AUTO');
  const attrs = card.attributes;

  return (
    <div className="grid two align-start">
      <section className="card page-panel premium-panel">
        <Link className="button secondary small" href="/dashboard/cartas">Voltar</Link>
        <div className="card-title-xl">
          <span className="badge">{card.rarity}</span>
          <h2>{card.player.name}</h2>
          <p className="muted">{card.name} • {card.playstyle ?? card.player.playstyle ?? 'Sem estilo'} • {toPtBrPositions(card.positions ?? card.player.mainPosition)} • OVR {card.maxOverall ?? card.overall}</p>
        </div>
        <div className="hero-pri"><span>PRI Geral</span><strong>{result.pri.overall.toFixed(1)}</strong></div>
        <div className="meter-grid">
          <PriMeter label="Finalização" value={result.pri.finishing} />
          <PriMeter label="Criação" value={result.pri.creation} />
          <PriMeter label="Drible" value={result.pri.dribbling} />
          <PriMeter label="Mobilidade" value={result.pri.mobility} />
          <PriMeter label="Pressão" value={result.pri.pressure} />
          <PriMeter label="Defesa" value={result.pri.defense} />
          <PriMeter label="Físico" value={result.pri.physical} />
          <PriMeter label="Resistência" value={result.pri.stamina} />
        </div>
      </section>

      <section className="card page-panel">
        <div className="section-title"><div><h2>Análise da carta</h2><p className="muted">Melhor posição, treino e habilidades adicionais.</p></div><span className="badge">{result.recommendedPositionPt ?? toPtBrPosition(result.recommendedPosition)}</span></div>
        <h3>Pontos de treino sugeridos</h3>
        <div className="chips">{Object.entries(result.training).filter(([, value]) => value > 0).map(([key, value]) => <span className="chip" key={key}>{key}: {value}</span>)}</div>
        <h3>Habilidades recomendadas</h3>
        <div className="chips">{result.recommendedSkills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
        <h3>Compatibilidade tática</h3>
        <div className="chips">{Object.entries(result.tacticalFit).map(([key, value]) => <span className="chip" key={key}>{key}: {value}/10</span>)}</div>
        <h3>Como usar</h3>
        <ul className="clean-list">{result.usageTips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
      </section>

      <section className="card page-panel full-span">
        <div className="section-title"><div><h2>Atributos completos</h2><p className="muted">Base usada no cálculo do PRI.</p></div></div>
        {attrs ? (
          <div className="attribute-read-grid">
            {Object.entries(attrs).filter(([key]) => !['id','cardId','createdAt','updatedAt'].includes(key)).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}
          </div>
        ) : <p className="muted">Sem atributos cadastrados.</p>}
      </section>
    </div>
  );
}
