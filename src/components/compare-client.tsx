'use client';

import { useState } from 'react';
import { POSITION_OPTIONS, toPtBrPosition, toPtBrPositions } from '@/lib/positions';

type CardOption = { id: string; label: string; position: string; maxOverall: number | null; overall: number };
type CompareRow = { id: string; player: string; cardName: string; rarity: string; position: string; overall: number; maxOverall: number | null; pri: Record<string, number>; tacticalFit: Record<string, number> };
type CompareResult = { winner: CompareRow; rows: CompareRow[] };

export function CompareClient({ cards }: { cards: CardOption[] }) {
  const [selected, setSelected] = useState<string[]>(cards.slice(0, 2).map((c) => c.id));
  const [targetPosition, setTargetPosition] = useState('AUTO');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [message, setMessage] = useState('');

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  }

  async function compare() {
    setMessage('');
    const response = await fetch('/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardIds: selected, targetPosition }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message ?? 'Falha ao comparar.');
      return;
    }
    setResult(data.result);
  }

  return (
    <div className="grid two align-start">
      <section className="card page-panel">
        <div className="section-title"><div><h2>Comparador Premium</h2><p className="muted">Selecione de 2 a 4 cartas e compare pelo PRI.</p></div><span className="badge">{selected.length}/4</span></div>
        <label className="field"><span>Posição alvo</span><select className="input" value={targetPosition} onChange={(e) => setTargetPosition(e.target.value)}>{POSITION_OPTIONS.map((pos) => <option key={pos.value} value={pos.value}>{pos.label}</option>)}</select></label>
        <div className="select-list">
          {cards.map((card) => (
            <button key={card.id} className={`select-card ${selected.includes(card.id) ? 'selected' : ''}`} type="button" onClick={() => toggle(card.id)}>
              <strong>{card.label}</strong><span>{toPtBrPositions(card.position)} • OVR {card.maxOverall ?? card.overall}</span>
            </button>
          ))}
        </div>
        {message && <div className="error-box">{message}</div>}
        <button className="button" disabled={selected.length < 2} onClick={compare} type="button">Comparar cartas</button>
      </section>

      <section className="card page-panel">
        <div className="section-title"><div><h2>Resultado</h2><p className="muted">Vencedor por rendimento real na função escolhida.</p></div>{result && <span className="badge">Venceu: {result.winner.player}</span>}</div>
        {!result && <p className="muted">A comparação aparece aqui.</p>}
        {result && (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Carta</th><th>Pos.</th><th>OVR</th><th>PRI</th><th>Criação</th><th>Finalização</th><th>Defesa</th></tr></thead>
              <tbody>
                {result.rows.sort((a, b) => b.pri.overall - a.pri.overall).map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.player}</strong><div className="muted mini">{row.cardName} • {row.rarity}</div></td>
                    <td><span className="badge">{toPtBrPosition(row.position)}</span></td>
                    <td>{row.maxOverall ?? row.overall}</td>
                    <td><strong>{row.pri.overall.toFixed(1)}</strong></td>
                    <td>{row.pri.creation.toFixed(1)}</td>
                    <td>{row.pri.finishing.toFixed(1)}</td>
                    <td>{row.pri.defense.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
