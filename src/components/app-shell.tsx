import { NavLink, type NavIconName } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

type AppShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
};

type NavItem = {
  href: string;
  icon: NavIconName;
  label: string;
};

const primaryMobileNav: NavItem[] = [
  { href: '/dashboard', icon: 'home', label: 'Início' },
  { href: '/dashboard/analisar-imagem', icon: 'camera', label: 'Analisar' },
  { href: '/dashboard/cartas', icon: 'cards', label: 'Cartas' },
  { href: '/dashboard/recomendacoes', icon: 'build', label: 'Build AI' }
];

const sidebarNav: NavItem[] = [
  { href: '/dashboard', icon: 'home', label: 'Dashboard' },
  { href: '/dashboard/jogadores', icon: 'players', label: 'Jogadores' },
  { href: '/dashboard/cartas', icon: 'cards', label: 'Cartas' },
  { href: '/dashboard/recomendacoes', icon: 'build', label: 'Build AI' },
  { href: '/dashboard/analisar-imagem', icon: 'camera', label: 'Analisar Imagem' },
  { href: '/dashboard/comparador', icon: 'compare', label: 'Comparador' },
  { href: '/dashboard/importar', icon: 'upload', label: 'Importar' },
  { href: '/dashboard/sincronizacao', icon: 'sync', label: 'Sincronização' }
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
          {sidebarNav.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
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
