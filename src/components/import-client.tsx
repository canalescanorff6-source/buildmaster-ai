'use client';

import { useMemo, useState } from 'react';
import { csvImportTemplate } from '@/lib/integrations/csv-to-external-card';

const jsonExample = JSON.stringify({
  source: { name: 'Upload do usuário', kind: 'USER_UPLOAD', termsAccepted: true },
  cards: [
    {
      sourceExternalId: 'meu-jogador-001',
      playerName: 'Exemplo Jogador',
      club: 'Free Agents',
      country: 'Brazil',
      mainPosition: 'AMF',
      secondaryPositions: ['SS', 'CMF'],
      playerPlaystyle: 'Creative Playmaker',
      dominantFoot: 'RIGHT',
      cardName: 'Featured Exemplo',
      rarity: 'FEATURED',
      overall: 90,
      maxOverall: 96,
      positions: ['AMF', 'SS'],
      nativeSkills: ['One-touch Pass', 'Through Passing'],
      recommendedSkills: ['Double Touch', 'Sole Control'],
      attributes: { finishing: 82, ballControl: 90, dribbling: 88, lowPass: 87, speed: 84, acceleration: 86, stamina: 80 }
    }
  ]
}, null, 2);

type Mode = 'json' | 'csv';

export function ImportClient() {
  const [mode, setMode] = useState<Mode>('csv');
  const [jsonText, setJsonText] = useState(jsonExample);
  const [csvText, setCsvText] = useState(csvImportTemplate);
  const [sourceName, setSourceName] = useState('Minha Base Manual');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const currentHelp = useMemo(() => {
    if (mode === 'csv') return 'Cole o CSV exportado da sua planilha. Use | para separar posições e habilidades.';
    return 'Cole um feed JSON no formato { source, cards }. Melhor para integrações e exportações estruturadas.';
  }, [mode]);

  async function submit() {
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(mode === 'csv' ? '/api/import/cards/csv' : '/api/import/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: mode === 'csv'
          ? JSON.stringify({ sourceName, csv: csvText })
          : JSON.stringify(JSON.parse(jsonText))
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message ?? 'Falha na importação.');
        return;
      }
      const warnings = data.warnings?.length ? ` Avisos: ${data.warnings.join(' | ')}` : '';
      const errors = data.errors?.length ? ` Erros: ${data.errors.slice(0, 3).map((e: { index: number; message: string }) => `linha ${e.index + 2}: ${e.message}`).join(' | ')}` : '';
      setMessage(`${data.createdRows ?? 0} criadas, ${data.updatedRows ?? 0} atualizadas, ${data.skippedRows ?? 0} ignoradas.${warnings}${errors}`);
    } catch {
      setMessage(mode === 'csv' ? 'CSV inválido ou erro de envio.' : 'JSON inválido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card page-panel">
      <div className="section-title">
        <div>
          <h2>Importar base de cartas</h2>
          <p className="muted">Alimente sua própria base por CSV ou JSON, sem depender de scraping.</p>
        </div>
        <span className="badge">{mode.toUpperCase()}</span>
      </div>

      <div className="grid two">
        <button className={mode === 'csv' ? 'button' : 'ghost-button'} onClick={() => setMode('csv')} type="button">Importar CSV</button>
        <button className={mode === 'json' ? 'button' : 'ghost-button'} onClick={() => setMode('json')} type="button">Importar JSON</button>
      </div>

      <label className="form-field">
        <span>Nome da fonte</span>
        <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Minha Base Manual" />
      </label>

      <div className="info-box">{currentHelp}</div>

      {mode === 'csv' ? (
        <textarea className="textarea" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
      ) : (
        <textarea className="textarea" value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
      )}

      {message && <div className="info-box">{message}</div>}
      <button className="button" onClick={submit} type="button" disabled={loading}>{loading ? 'Importando...' : 'Importar base'}</button>
    </section>
  );
}
