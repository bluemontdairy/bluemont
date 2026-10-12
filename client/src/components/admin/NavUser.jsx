'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import u from './NavUser.module.css';
import { ROLE_LABELS } from '../../lib/roles';

// Signed-in admin menu in the style of shadcn/ui's sidebar "NavUser": an
// avatar + name/email trigger that opens a small menu. Keyboard: Enter/Space
// or ArrowUp/Down open it, arrows move, Home/End jump, Escape or Tab close.

const Icon = ({ d, size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const ICONS = {
  chevrons: <><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  external: <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  logout: <><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></>,
};

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

function Avatar({ name, size = 'md' }) {
  return (
    <span className={`${u.avatar} ${size === 'sm' ? u.avatarSm : ''}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** `compact` shows only the avatar (mobile top bar); the menu then opens downward. */
export default function NavUser({ admin, compact = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  // Opened with the keyboard → highlight the first item (like Radix); opened
  // with a click → focus the menu itself, so nothing looks pre-selected.
  const keyboardOpen = useRef(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const items = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
  const focusItem = (index) => {
    const list = items();
    if (list.length) list[(index + list.length) % list.length].focus();
  };

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  // Close on outside click and when the page changes.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, close]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (keyboardOpen.current) menu?.querySelector('[role="menuitem"]')?.focus();
      else menu?.focus();
    });
  }, [open]);

  const onTriggerKey = (e) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      keyboardOpen.current = true;
      setOpen(true);
    }
  };

  const onMenuKey = (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem(i + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(i === -1 ? list.length - 1 : i - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(list.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const logout = async () => {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  const role = ROLE_LABELS[admin.role] || admin.role;

  return (
    <div ref={rootRef} className={`${u.root} ${compact ? u.compact : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={u.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={compact ? `Account menu for ${admin.username}` : undefined}
        data-state={open ? 'open' : 'closed'}
        onClick={(e) => {
          // detail is 0 when Enter/Space "clicked" the button.
          keyboardOpen.current = e.detail === 0;
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKey}
      >
        <Avatar name={admin.username} />
        {!compact && (
          <>
            <span className={u.who}>
              <span className={u.name}>{admin.username}</span>
              <span className={u.email}>{admin.email}</span>
            </span>
            <span className={u.chevron}><Icon d={ICONS.chevrons} /></span>
          </>
        )}
      </button>

      {open && (
        <div ref={menuRef} id={menuId} role="menu" aria-label="Account" tabIndex={-1} className={u.menu} onKeyDown={onMenuKey}>
          <div className={u.label}>
            <Avatar name={admin.username} size="sm" />
            <span className={u.who}>
              <span className={u.labelName}>{admin.username}</span>
              <span className={u.labelEmail}>{admin.email}</span>
            </span>
          </div>
          <div className={u.roleRow}>
            <span className={u.roleBadge}>{role}</span>
          </div>
          <div className={u.separator} role="separator" />
          <Link href="/admin/account" role="menuitem" tabIndex={-1} className={u.item}>
            <Icon d={ICONS.shield} />
            Account &amp; security
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" role="menuitem" tabIndex={-1} className={u.item}>
            <Icon d={ICONS.external} />
            View website
          </a>
          <div className={u.separator} role="separator" />
          <button type="button" role="menuitem" tabIndex={-1} className={`${u.item} ${u.itemDanger}`} onClick={logout} disabled={signingOut}>
            <Icon d={ICONS.logout} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
