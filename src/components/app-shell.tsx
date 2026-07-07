import { Bot, Camera, CreditCard, DatabaseZap, GitCompareArrows, Home, Upload, UsersRound } from 'lucide-react';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

type AppShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
};

const primaryMobileNav = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/dashboard/analisar-imagem', icon: Camera, label: 'Analisar' },
  { href: '/dashboard/cartas', icon: CreditCard, label: 'Cartas' },
  { href: '/dashboard/recomendacoes', icon: Bot, label: 'Build AI' }
];

export function AppShell({ children, user }: AppShellProps) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="app-shell mobile-ready-shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">BM</div>
          <div>
            <strong>BuildMaster AI</strong>
            <span>Performance Real Index</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink href="/dashboard" icon={Home} label="Dashboard" />
          <NavLink href="/dashboard/jogadores" icon={UsersRound} label="Jogadores" />
          <NavLink href="/dashboard/cartas" icon={CreditCard} label="Cartas" />
          <NavLink href="/dashboard/recomendacoes" icon={Bot} label="Build AI" />
          <NavLink href="/dashboard/analisar-imagem" icon={Camera} label="Analisar Imagem" />
          <NavLink href="/dashboard/comparador" icon={GitCompareArrows} label="Comparador" />
          <NavLink href="/dashboard/importar" icon={Upload} label="Importar" />
          <NavLink href="/dashboard/sincronizacao" icon={DatabaseZap} label="Sincronização" />
        </nav>
      </aside>

      <main className="shell-main">
        <header className="topbar mobile-topbar">
          <div>
            <p className="mobile-kicker">BuildMaster AI Mobile</p>
            <h1>Painel BuildMaster</h1>
            <p className="muted">Gerencie cartas, calcule PRI e gere builds inteligentes.</p>
          </div>

          <div className="user-box">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user.name}</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'} • {user.email}
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        {children}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegação principal mobile">
        {primaryMobileNav.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
      </nav>
    </div>
  );
}
