'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Bot,
  Camera,
  CreditCard,
  DatabaseZap,
  GitCompareArrows,
  Home,
  Upload,
  UsersRound
} from 'lucide-react';

export type NavIconName =
  | 'home'
  | 'players'
  | 'cards'
  | 'build'
  | 'camera'
  | 'compare'
  | 'upload'
  | 'sync';

const icons = {
  home: Home,
  players: UsersRound,
  cards: CreditCard,
  build: Bot,
  camera: Camera,
  compare: GitCompareArrows,
  upload: Upload,
  sync: DatabaseZap
} satisfies Record<NavIconName, React.ComponentType<{ size?: number }>>;

type NavLinkProps = {
  href: string;
  label: string;
  icon: NavIconName;
};

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  const Icon = icons[icon];

  return (
    <Link className={clsx('nav-link', active && 'active')} href={href}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
