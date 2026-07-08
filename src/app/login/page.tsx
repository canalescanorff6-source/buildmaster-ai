'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('thiago0126');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? 'Não foi possível entrar.');
      }
      window.location.href = '/';
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <span className="brand-pill"><Sparkles size={16} /> BuildMaster Local Pro</span>
          <h1>Área segura do seu app local de fichas Elite.</h1>
          <p>Entre para liberar a OCR local, motor de pontos real, habilidades adicionais e histórico local das cartas.</p>
          <div className="login-features">
            <span><ShieldCheck size={15} /> sessão protegida</span>
            <span><LockKeyhole size={15} /> acesso privado</span>
            <span><Sparkles size={15} /> visual premium</span>
          </div>
        </div>

        <form className="login-card glass-panel" onSubmit={handleSubmit}>
          <div className="login-card-head">
            <div>
              <p className="eyebrow">Login</p>
              <h2>Entrar no BuildMaster</h2>
            </div>
            <LockKeyhole size={26} />
          </div>

          <label className="login-field">
            Usuário
            <span>
              <UserRound size={18} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
            </span>
          </label>

          <label className="login-field">
            Senha
            <span>
              <LockKeyhole size={18} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite a senha"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && <p className="login-error">{error}</p>}

          <button className="primary-button login-submit" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar com segurança'}
          </button>

          <p className="microcopy">Dica: depois de entrar, o app mantém a sessão por 14 dias neste navegador.</p>
        </form>
      </section>
    </main>
  );
}
