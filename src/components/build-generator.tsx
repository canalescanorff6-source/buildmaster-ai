'use client';

import { useState } from 'react';
import { PriMeter } from '@/components/pri-meter';
import { POSITION_OPTIONS, toPtBrPosition, toPtBrPositions } from '@/lib/positions';

type CardOption = { id: string; label: string; position: string; maxOverall: number | null; overall: number };
type Result = {
  pri: Record<string, number>;
  tacticalFit: Record<string, number>;
  recommendedPosition: string;
  recommendedPositionPt?: string;
  training: Record<string, number>;
  recommendedSkills: string[];
  strengths: string[];
  weaknesses: string[];
  usageTips: string[];
};

const objectiveLabels: Record<string, string> = {
  COMPETITIVE: 'Competitivo', MAX_OVERALL: 'Maior Overall', FINISHER: 'Finalizador', CREATOR: 'Criador', DRIBBLER: 'Driblador', PRESSING: 'Pressão alta', POSSESSION: 'Posse de bola', QUICK_COUNTER: 'Contra-ataque rápido', DEFENSIVE: 'Defensivo', AERIAL: 'Jogo aéreo'
};

const trainingLabels: Record<string, string> = {
  shooting: 'Chute', passing: 'Passe', dribbling: 'Drible', dexterity: 'Destreza', lowerBodyStrength: 'Força pernas', aerialStrength: 'Bola aérea', defending: 'Defesa', gk1: 'Goleiro 1', gk2: 'Goleiro 2', gk3: 'Goleiro 3'
};

export function BuildGenerator({ cards }: { cards: CardOption[] }) {
  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const [objective, setObjective] = useState('COMPETITIVE');
  const [targetPosition, setTargetPosition] = useState('AUTO');
  const [teamStyle, setTeamStyle] = useState('Quick Counter');
  const [save, setSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState('');

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/engine/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, objective, targetPosition, teamStyle, formation: '4-2-2-2', save })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(data.message ?? 'Falha ao gerar build.');
      return;
    }
    setResult(data.result);
  }

  return (
    <div className="grid two align-start">
      <section className="card page-panel">
        <div className="section-title">
          <div><h2>Build AI</h2><p className="muted">Gere uma build baseada em PRI, função e estilo de jogo.</p></div>
          <span className="badge">Motor PRI</span>
        </div>
        <form className="form" onSubmit={generate}>
          <label className="field"><span>Carta</span><select className="input" value={cardId} onChange={(e) => setCardId(e.target.value)}>{cards.map((card) => <option key={card.id} value={card.id}>{card.label} • {toPtBrPositions(card.position)} • {card.maxOverall ?? card.overall}</option>)}</select></label>
          <div className="form-row">
            <label className="field"><span>Objetivo</span><select className="input" value={objective} onChange={(e) => setObjective(e.target.value)}>{Object.entries(objectiveLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="field"><span>Posição alvo</span><select className="input" value={targetPosition} onChange={(e) => setTargetPosition(e.target.value)}>{POSITION_OPTIONS.map((pos) => <option key={pos.value} value={pos.value}>{pos.label}</option>)}</select></label>
          </div>
          <label className="field"><span>Estilo do time</span><select className="input" value={teamStyle} onChange={(e) => setTeamStyle(e.target.value)}><option>Quick Counter</option><option>Possession Game</option><option>Long Ball Counter</option><option>Out Wide</option><option>Long Ball</option></select></label>
          <label className="check"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Salvar build gerada no histórico</label>
          {message && <div className="error-box">{message}</div>}
          <button className="button" disabled={loading || !cardId} type="submit">{loading ? 'Gerando...' : 'Gerar build inteligente'}</button>
        </form>
      </section>

      <section className="card page-panel">
        <div className="section-title"><div><h2>Resultado</h2><p className="muted">Análise prática para usar dentro de campo.</p></div>{result && <span className="badge">PRI {result.pri.overall.toFixed(1)}</span>}</div>
        {!result && <p className="muted">Escolha uma carta e gere a análise.</p>}
        {result && (
          <div className="result-stack">
            <div className="hero-pri"><span>Melhor posição real</span><strong>{result.recommendedPositionPt ?? toPtBrPosition(result.recommendedPosition)}</strong></div>
            <div className="meter-grid">
              <PriMeter label="Finalização" value={result.pri.finishing} />
              <PriMeter label="Criação" value={result.pri.creation} />
              <PriMeter label="Drible" value={result.pri.dribbling} />
              <PriMeter label="Mobilidade" value={result.pri.mobility} />
              <PriMeter label="Pressão" value={result.pri.pressure} />
              <PriMeter label="Defesa" value={result.pri.defense} />
            </div>
            <div>
              <h3>Pontos de treino</h3>
              <div className="chips">{Object.entries(result.training).filter(([, value]) => value > 0).map(([key, value]) => <span className="chip" key={key}>{trainingLabels[key] ?? key}: {value}</span>)}</div>
            </div>
            <div>
              <h3>Habilidades adicionais</h3>
              <div className="chips">{result.recommendedSkills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
            </div>
            <div className="grid two simple">
              <div><h3>Fortes</h3><ul className="clean-list">{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Fracos</h3><ul className="clean-list">{(result.weaknesses.length ? result.weaknesses : ['Sem fraqueza crítica']).map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
            <div><h3>Como usar</h3><ul className="clean-list">{result.usageTips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
          </div>
        )}
      </section>
    </div>
  );
}
