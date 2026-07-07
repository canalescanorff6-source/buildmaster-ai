'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message ?? 'Não foi possível continuar.');
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      <section className="auth-card">
        <span className="brand-pill"><Sparkles size={16} /> BuildMaster AI</span>
        <h1>{isLogin ? 'Entrar no painel' : 'Criar conta'}</h1>
        <p>{isLogin ? 'Acesse o motor de builds e análise PRI.' : 'Crie sua conta para salvar builds e comparações.'}</p>

        <form className="form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="field">
              <span>Nome</span>
              <input className="input" name="name" placeholder="Seu nome" required minLength={3} />
            </label>
          )}

          <label className="field">
            <span>E-mail</span>
            <input className="input" name="email" type="email" placeholder="admin@buildmaster.ai" required />
          </label>

          <label className="field">
            <span>Senha</span>
            <input className="input" name="password" type="password" placeholder="admin123456" required minLength={isLogin ? 1 : 8} />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button className="button" disabled={loading} type="submit">
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <Link href={isLogin ? '/register' : '/login'}>{isLogin ? 'Criar conta' : 'Entrar'}</Link>
        </p>
      </section>
    </div>
  );
}
