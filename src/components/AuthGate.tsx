'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

const AUTH_KEY = 'buildmaster_local_auth_v6_1';
const LOGIN_USER = 'thiago0126';
const LOGIN_PASSWORD = 'iu1fsaa67a';

function makeSessionToken() {
  return `bm-local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hasValidLocalSession() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as { token?: string; createdAt?: number };
    if (!session.token || !session.createdAt) return false;
    const fourteenDays = 1000 * 60 * 60 * 24 * 14;
    if (Date.now() - session.createdAt > fourteenDays) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return false;
  }
}

function saveLocalSession() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ token: makeSessionToken(), createdAt: Date.now() }));
}

export function clearBuildMasterSession() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignora bloqueio de localStorage em modo privado.
  }
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState(LOGIN_USER);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const cleanUser = username.trim();
    const cleanPassword = password.trim();

    window.setTimeout(() => {
      if (cleanUser !== LOGIN_USER || cleanPassword !== LOGIN_PASSWORD) {
        setError('Usuário ou senha incorretos. Confira e tente novamente.');
        setLoading(false);
        return;
      }

      try {
        saveLocalSession();
        onSuccess();
      } catch {
        setError('O navegador bloqueou o salvamento da sessão. Desative modo privado ou limpe os dados do site.');
        setLoading(false);
      }
    }, 180);
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <span className="brand-pill"><Sparkles size={16} /> BuildMaster Local Pro</span>
          <h1>Acesso privado, rápido e sem travar no celular.</h1>
          <p>Login local corrigido: não depende mais de cookie da Vercel, middleware ou API. Entrou, liberou o app no próprio navegador por 14 dias.</p>
          <div className="login-features">
            <span><ShieldCheck size={15} /> login local</span>
            <span><LockKeyhole size={15} /> acesso privado</span>
            <span><Sparkles size={15} /> versão hotfix</span>
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

          <p className="microcopy">Usuário: <strong>thiago0126</strong>. A sessão fica salva somente neste navegador.</p>
        </form>
      </section>
    </main>
  );
}

export function AuthGate({ children }: { children?: ReactNode; loginPage?: boolean }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(hasValidLocalSession());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="login-page">
        <section className="login-card glass-panel login-loading-card">
          <p className="eyebrow">BuildMaster</p>
          <h2>Verificando acesso...</h2>
          <p className="microcopy">Se esta tela ficar parada, limpe o cache do site e confirme se o arquivo middleware.ts novo foi enviado ao GitHub.</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
  }

  return <>{children}</>;
}
