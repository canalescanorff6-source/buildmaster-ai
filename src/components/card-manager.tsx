'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toPtBrPosition, toPtBrPositions } from '@/lib/positions';

type PlayerOption = { id: string; name: string; mainPosition: string };
type AttributeRow = {
  offensiveAwareness: number; ballControl: number; dribbling: number; tightPossession: number; lowPass: number; loftedPass: number; finishing: number; heading: number; placeKicking: number; curl: number; speed: number; acceleration: number; kickingPower: number; jump: number; physicalContact: number; balance: number; stamina: number; defensiveAwareness: number; tackling: number; aggression: number; defensiveEngagement: number; goalkeeperAwareness: number; goalkeeperCatching: number; goalkeeperParrying: number; goalkeeperReflexes: number; goalkeeperReach: number;
};
type CardRow = {
  id: string;
  playerId: string;
  playerName: string;
  name: string;
  rarity: string;
  overall: number;
  maxOverall: number | null;
  playstyle: string | null;
  season: string | null;
  positions: string | null;
  attributes: Partial<AttributeRow> | null;
};

type CardManagerProps = { cards: CardRow[]; players: PlayerOption[] };

const defaultAttributes: AttributeRow = {
  offensiveAwareness: 80, ballControl: 80, dribbling: 80, tightPossession: 80, lowPass: 75, loftedPass: 72, finishing: 80, heading: 70, placeKicking: 70, curl: 75, speed: 80, acceleration: 80, kickingPower: 80, jump: 70, physicalContact: 70, balance: 80, stamina: 80, defensiveAwareness: 50, tackling: 50, aggression: 55, defensiveEngagement: 50, goalkeeperAwareness: 40, goalkeeperCatching: 40, goalkeeperParrying: 40, goalkeeperReflexes: 40, goalkeeperReach: 40
};

const baseForm = {
  playerId: '', name: '', season: '2026', rarity: 'STANDARD', overall: '90', maxOverall: '95', playstyle: '', positions: '', imageUrl: ''
};

const attributeGroups = [
  ['Ataque', ['offensiveAwareness', 'finishing', 'kickingPower', 'heading', 'curl']],
  ['Técnica', ['ballControl', 'dribbling', 'tightPossession', 'lowPass', 'loftedPass']],
  ['Mobilidade', ['speed', 'acceleration', 'balance', 'stamina', 'physicalContact']],
  ['Defesa', ['defensiveAwareness', 'tackling', 'aggression', 'defensiveEngagement', 'jump']]
] as const;

const labels: Record<string, string> = {
  offensiveAwareness: 'Consciência ofensiva', ballControl: 'Controle', dribbling: 'Drible', tightPossession: 'Condução firme', lowPass: 'Passe rasteiro', loftedPass: 'Passe alto', finishing: 'Finalização', heading: 'Cabeceio', placeKicking: 'Bola parada', curl: 'Efeito', speed: 'Velocidade', acceleration: 'Aceleração', kickingPower: 'Força do chute', jump: 'Impulsão', physicalContact: 'Contato físico', balance: 'Equilíbrio', stamina: 'Resistência', defensiveAwareness: 'Consciência defensiva', tackling: 'Desarme', aggression: 'Agressividade', defensiveEngagement: 'Engajamento defensivo'
};

export function CardManager({ cards, players }: CardManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...baseForm, playerId: players[0]?.id ?? '' });
  const [attributes, setAttributes] = useState<AttributeRow>(defaultAttributes);
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => cards.filter((card) => [card.playerName, card.name, card.rarity, card.positions ?? ''].join(' ').toLowerCase().includes(q.toLowerCase())), [cards, q]);

  function update(name: string, value: string) { setForm((current) => ({ ...current, [name]: value })); }
  function updateAttr(name: keyof AttributeRow, value: string) { setAttributes((current) => ({ ...current, [name]: Number(value) })); }

  function reset() {
    setEditingId(null);
    setForm({ ...baseForm, playerId: players[0]?.id ?? '' });
    setAttributes(defaultAttributes);
    setMessage('');
  }

  function startEdit(card: CardRow) {
    setEditingId(card.id);
    setForm({
      playerId: card.playerId,
      name: card.name,
      season: card.season ?? '2026',
      rarity: card.rarity,
      overall: String(card.overall),
      maxOverall: card.maxOverall?.toString() ?? '',
      playstyle: card.playstyle ?? '',
      positions: card.positions ?? '',
      imageUrl: ''
    });
    setAttributes({ ...defaultAttributes, ...(card.attributes ?? {}) });
    setMessage('Editando carta selecionada.');
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/cards/${editingId}` : '/api/cards', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, attributes })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message ?? 'Falha ao salvar carta.');
      return;
    }
    reset();
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta carta?')) return;
    await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="grid two align-start wide-left">
      <section className="card page-panel">
        <div className="section-title">
          <div><h2>{editingId ? 'Editar carta' : 'Cadastrar carta'}</h2><p className="muted">Inclui atributos usados pelo motor PRI.</p></div>
          {editingId && <button className="button secondary small" type="button" onClick={reset}>Cancelar</button>}
        </div>

        <form className="form compact" onSubmit={submit}>
          <label className="field"><span>Jogador</span><select className="input" value={form.playerId} onChange={(e) => update('playerId', e.target.value)} required>{players.map((p) => <option key={p.id} value={p.id}>{p.name} • {toPtBrPosition(p.mainPosition)}</option>)}</select></label>
          <label className="field"><span>Nome da carta</span><input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Epic, POTW, Big Time..." required /></label>
          <div className="form-row three">
            <label className="field"><span>Raridade</span><select className="input" value={form.rarity} onChange={(e) => update('rarity', e.target.value)}>{['STANDARD','FEATURED','POTW','HIGHLIGHT','TRENDING','LEGEND','EPIC','BIG_TIME','SHOW_TIME','SPECIAL'].map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="field"><span>OVR</span><input className="input" type="number" value={form.overall} onChange={(e) => update('overall', e.target.value)} /></label>
            <label className="field"><span>OVR Máx.</span><input className="input" type="number" value={form.maxOverall} onChange={(e) => update('maxOverall', e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label className="field"><span>Temporada</span><input className="input" value={form.season} onChange={(e) => update('season', e.target.value)} /></label>
            <label className="field"><span>Posições da carta</span><input className="input" value={form.positions} onChange={(e) => update('positions', e.target.value.toUpperCase())} placeholder="CA, SA, MAT" /></label>
          </div>
          <label className="field"><span>Estilo da carta</span><input className="input" value={form.playstyle} onChange={(e) => update('playstyle', e.target.value)} /></label>

          <div className="attributes-grid">
            {attributeGroups.map(([group, names]) => (
              <div className="attribute-group" key={group}>
                <strong>{group}</strong>
                {names.map((name) => (
                  <label className="field mini-field" key={name}>
                    <span>{labels[name]}</span>
                    <input className="input" type="number" min="1" max="110" value={attributes[name as keyof AttributeRow]} onChange={(e) => updateAttr(name as keyof AttributeRow, e.target.value)} />
                  </label>
                ))}
              </div>
            ))}
          </div>
          {message && <div className="info-box">{message}</div>}
          <button className="button" type="submit">{editingId ? 'Salvar carta' : 'Cadastrar carta'}</button>
        </form>
      </section>

      <section className="card page-panel">
        <div className="section-title"><div><h2>Cartas</h2><p className="muted">Lista com busca, detalhes, edição e exclusão.</p></div><span className="badge">{cards.length} cartas</span></div>
        <input className="input" placeholder="Buscar carta, jogador ou raridade" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Carta</th><th>Tipo</th><th>OVR</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map((card) => (
                <tr key={card.id}>
                  <td><strong>{card.playerName}</strong><div className="muted mini">{card.name} • {toPtBrPositions(card.positions) || '-'}</div></td>
                  <td><span className="badge">{card.rarity}</span></td>
                  <td>{card.maxOverall ?? card.overall}</td>
                  <td className="actions"><Link className="button secondary small" href={`/dashboard/cartas/${card.id}`}>Abrir</Link><button className="button secondary small" onClick={() => startEdit(card)} type="button">Editar</button><button className="danger small" onClick={() => remove(card.id)} type="button">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
