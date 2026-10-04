'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import s from './admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Partner leads', count: 'newLeads' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/messages', label: 'Messages', count: 'unreadMessages' },
];

export default function AdminNav({ admin, counts }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <nav className={s.nav} aria-label="Admin">
      <div className={s.navTop}>
        <Link href="/admin" className={s.navBrand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo/badge.webp" alt="" />
          Blue Mont admin
        </Link>
        <button type="button" className={`${s.btnLink} ${s.navFooterMobile}`} onClick={logout}>
          Sign out
        </button>
      </div>

      <div className={s.navLinks}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${s.navLink} ${isActive(link.href) ? s.navLinkActive : ''}`}
            aria-current={isActive(link.href) ? 'page' : undefined}
          >
            {link.label}
            {link.count && counts[link.count] > 0 && <span className={s.navCount}>{counts[link.count]}</span>}
          </Link>
        ))}
      </div>

      <div className={s.navFooter}>
        <span>Signed in as {admin.username}</span>
        <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
        <button type="button" className={s.btnLink} onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
