'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './admin.module.css';
import NavUser from './NavUser';
import { can } from '../../lib/roles';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Partner leads', count: 'newLeads' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories', permission: 'categories.manage' },
  { href: '/admin/reviews', label: 'Reviews', permission: 'reviews.edit' },
  { href: '/admin/site-media', label: 'Site images', permission: 'siteMedia.manage' },
  { href: '/admin/settings', label: 'Site settings', permission: 'settings.manage' },
  { href: '/admin/messages', label: 'Messages', count: 'unreadMessages' },
  { href: '/admin/admins', label: 'Admins', permission: 'admins.manage' },
];

export default function AdminNav({ admin, counts, logo }) {
  const pathname = usePathname();

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <nav className={s.nav} aria-label="Admin">
      <div className={s.navTop}>
        <Link href="/admin" className={s.navBrand}>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" />
          )}
          Blue Mont admin
        </Link>
        <div className={s.navFooterMobile}>
          <NavUser admin={admin} compact />
        </div>
      </div>

      <div className={s.navLinks}>
        {LINKS.filter((link) => !link.permission || can(admin, link.permission)).map((link) => (
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
        <NavUser admin={admin} />
      </div>
    </nav>
  );
}
