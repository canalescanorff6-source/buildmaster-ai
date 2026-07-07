'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { POSITION_OPTIONS, toPtBrPosition, toPtBrPositions } from '@/lib/positions';

type PlayerRow = {
  id: string;
  name: string;
  club: string | null;
  country: string | null;
  mainPosition: string;
  secondaryPositions: string | null;
  playstyle: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  dominantFoot: 'RIGHT' | 'LEFT' | 'BOTH';
  cardsCount: number;
};

type PlayerManagerProps = { players: PlayerRow[] };

const emptyForm = {
  name: '',
  club: '',
  country: '',
  mainPosition: 'CA',
  secondaryPositions: '',
  playstyle: '',
  height: '',
  weight: '',
  age: '',
  dominantFoot: 'RIGHT'
};

export function PlayerManager({ players }: PlayerManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => {
    return players.filter((player) =>
      [player.name, player.club ?? '', player.country ?? '', player.mainPosition, player.playstyle ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [players, q]);

  function startEdit(player: PlayerRow) {
    setEditingId(player.id);
    setForm({
      name: player.name,
      club: player.club ?? '',
      country: player.country ?? '',
      mainPosition: toPtBrPosition(player.mainPosition),
      secondaryPositions: toPtBrPositions(player.secondaryPositions),
      playstyle: player.playstyle ?? '',
      height: player.height?.toString() ?? '',
      weight: player.weight?.toString() ?? '',
      age: player.age?.toString() ?? '',
      dominantFoot: player.dominantFoot
    });
    setMessage('Editando jogador selecionado.');
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/players/${editingId}` : '/api/players', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message ?? 'Falha ao salvar.');
      return;
    }

    reset();
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Excluir este jogador e as cartas relacionadas?')) return;
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="grid two align-start">
      <section className="card page-panel">
        <div className="section-title">
          <div>
            <h2>{editingId ? 'Editar jogador' : 'Cadastrar jogador'}</h2>
            <p className="muted">Base própria para alimentar as cartas sem depender de scraping.</p>
          </div>
          {editingId && <button className="button secondary small" type="button" onClick={reset}>Cancelar</button>}
        </div>

        <form className="form compact" onSubmit={submit}>
          <label className="field"><span>Nome</span><input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required /></label>
          <div className="form-row">
            <label className="field"><span>Clube</span><input className="input" value={form.club} onChange={(e) => update('club', e.target.value)} /></label>
            <label className="field"><span>País</span><input className="input" value={form.country} onChange={(e) => update('country', e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label className="field"><span>Posição principal</span><select className="input" value={form.mainPosition} onChange={(e) => update('mainPosition', e.target.value)} required>{POSITION_OPTIONS.filter((p) => p.value !== 'AUTO').map((p) => <option key={p.value} value={p.label.split(' ')[0]}>{p.label}</option>)}</select></label>
            <label className="field"><span>Posições secundárias</span><input className="input" value={form.secondaryPositions} onChange={(e) => update('secondaryPositions', e.target.value.toUpperCase())} placeholder="SA, MAT, PD" /></label>
          </div>
          <label className="field"><span>Estilo de jogo</span><input className="input" value={form.playstyle} onChange={(e) => update('playstyle', e.target.value)} placeholder="Artilheiro, Criador de jogadas..." /></label>
          <div className="form-row three">
            <label className="field"><span>Altura</span><input className="input" type="number" value={form.height} onChange={(e) => update('height', e.target.value)} /></label>
            <label className="field"><span>Peso</span><input className="input" type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} /></label>
            <label className="field"><span>Idade</span><input className="input" type="number" value={form.age} onChange={(e) => update('age', e.target.value)} /></label>
          </div>
          <label className="field">
            <span>Pé dominante</span>
            <select className="input" value={form.dominantFoot} onChange={(e) => update('dominantFoot', e.target.value)}>
              <option value="RIGHT">Direito</option>
              <option value="LEFT">Esquerdo</option>
              <option value="BOTH">Ambos</option>
            </select>
          </label>
          {message && <div className="info-box">{message}</div>}
          <button className="button" type="submit">{editingId ? 'Salvar alterações' : 'Cadastrar jogador'}</button>
        </form>
      </section>

      <section className="card page-panel">
        <div className="section-title">
          <div>
            <h2>Jogadores</h2>
            <p className="muted">Busque, edite ou exclua jogadores cadastrados.</p>
          </div>
          <span className="badge">{players.length} jogadores</span>
        </div>
        <input className="input" placeholder="Buscar por nome, clube, país ou posição" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nome</th><th>Pos.</th><th>Cartas</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map((player) => (
                <tr key={player.id}>
                  <td><strong>{player.name}</strong><div className="muted mini">{player.club ?? '-'} • {player.playstyle ?? '-'}</div></td>
                  <td><span className="badge">{toPtBrPosition(player.mainPosition)}</span><div className="muted mini">{toPtBrPositions(player.secondaryPositions)}</div></td>
                  <td>{player.cardsCount}</td>
                  <td className="actions"><button className="button secondary small" onClick={() => startEdit(player)} type="button">Editar</button><button className="danger small" onClick={() => remove(player.id)} type="button">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
