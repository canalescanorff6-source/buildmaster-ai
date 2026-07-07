'use client';

import { useEffect, useState } from 'react';

type Source = {
  id: string;
  name: string;
  kind: string;
  baseUrl?: string | null;
  lastSyncedAt?: string | null;
  enabled: boolean;
};

type Job = {
  id: string;
  status: string;
  totalRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  createdAt: string;
  error?: string | null;
  source?: { name: string };
};

export function SyncClient() {
  const [feedUrl, setFeedUrl] = useState('');
  const [sourceName, setSourceName] = useState('Minha Fonte Autorizada');
  const [message, setMessage] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  async function refresh() {
    const response = await fetch('/api/admin/sync');
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setSources(data.sources ?? []);
      setJobs(data.jobs ?? []);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function runSync() {
    setMessage('Sincronizando...');
    const response = await fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedUrl: feedUrl || undefined, sourceName })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message || data.error || 'Falha na sincronização.');
      return;
    }
    setMessage(`${data.createdRows} criadas, ${data.updatedRows} atualizadas, ${data.skippedRows} ignoradas.`);
    refresh();
  }

  return (
    <div className="grid-two">
      <section className="card page-panel">
        <div className="section-title">
          <div>
            <h2>Sincronização automática</h2>
            <p className="muted">Conecte uma API ou JSON feed autorizado/licenciado para atualizar cartas reais.</p>
          </div>
          <span className="badge">Admin</span>
        </div>

        <label className="field-label">Nome da fonte</label>
        <input className="input" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />

        <label className="field-label">URL do feed autorizado</label>
        <input className="input" placeholder="https://sua-api.com/efootball/cards.json" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} />

        <div className="info-box">
          Use apenas fontes em que você tem permissão para consumir, armazenar e exibir os dados. Para rotina automática, configure AUTHORIZED_CARDS_FEED_URL e CRON_SECRET no .env.
        </div>

        {message && <div className="info-box">{message}</div>}
        <button className="button" type="button" onClick={runSync}>Sincronizar agora</button>
      </section>

      <section className="card page-panel">
        <div className="section-title"><div><h2>Fontes conectadas</h2><p className="muted">Últimas fontes e execuções de sincronização.</p></div></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Fonte</th><th>Tipo</th><th>Última sync</th></tr></thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id}>
                  <td>{source.name}</td>
                  <td>{source.kind}</td>
                  <td>{source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleString() : 'Nunca'}</td>
                </tr>
              ))}
              {!sources.length && <tr><td colSpan={3}>Nenhuma fonte registrada.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead><tr><th>Job</th><th>Status</th><th>Resultado</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.source?.name ?? 'Fonte'}<br /><span className="muted">{new Date(job.createdAt).toLocaleString()}</span></td>
                  <td>{job.status}</td>
                  <td>{job.createdRows} criadas · {job.updatedRows} atualizadas · {job.skippedRows} ignoradas</td>
                </tr>
              ))}
              {!jobs.length && <tr><td colSpan={3}>Nenhuma sincronização executada.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
