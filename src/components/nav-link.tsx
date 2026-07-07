'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

type NavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Link className={clsx('nav-link', active && 'active')} href={href}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
