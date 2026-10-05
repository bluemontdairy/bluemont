'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const LEFT_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/#brands', label: 'Our brands' },
  { href: '/#quality', label: 'Quality' },
];

const RIGHT_LINKS = [{ href: '/#contact', label: 'Contact' }];

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Condense the bar once the page has moved past the top of the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll behind the open mobile sheet; Escape closes it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsMenuOpen(false);
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (href) => pathname === href;
  const linkProps = (href) => ({
    className: `${styles.link} ${isActive(href) ? styles.active : ''}`,
    'aria-current': isActive(href) ? 'page' : undefined,
  });

  return (
    <div className={`${styles.headerWrapper} ${scrolled ? styles.scrolled : ''}`}>
      <header className={styles.header}>
        <nav className={`${styles.group} ${styles.groupLeft}`} aria-label="Primary">
          {LEFT_LINKS.map((l) => (
            <Link key={l.label} href={l.href} {...linkProps(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className={styles.logo} onClick={closeMenu} aria-label="Blue Mont Dairy, home">
          <Image
            src="/brand/logo/bluemont-white.webp"
            alt=""
            width={439}
            height={354}
            sizes="96px"
            className={styles.logoImg}
            preload
          />
        </Link>

        <nav className={`${styles.group} ${styles.groupRight}`} aria-label="Secondary">
          {RIGHT_LINKS.map((l) => (
            <Link key={l.label} href={l.href} {...linkProps(l.href)}>
              {l.label}
            </Link>
          ))}
          <Link href="/partner" className={`${styles.link} ${styles.cta}`}>
            <FreezerIcon />
            Stock us
          </Link>
        </nav>

        <button
          type="button"
          className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div
        className={`${styles.backdrop} ${isMenuOpen ? styles.backdropOpen : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <nav
        id="mobile-menu"
        className={`${styles.sheet} ${isMenuOpen ? styles.sheetOpen : ''}`}
        aria-label="Mobile"
        inert={!isMenuOpen}
      >
        <ul className={styles.sheetList}>
          {ALL_LINKS.map((l, i) => (
            <li key={l.label} style={{ '--i': i }}>
              <Link href={l.href} className={styles.sheetLink} onClick={closeMenu}>
                {l.label}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/partner" className={styles.sheetCta} onClick={closeMenu}>
          Stock Blue Mont in your store
        </Link>
        <Image
          src="/brand/mascots/yeti-wave.webp"
          alt=""
          width={840}
          height={900}
          sizes="120px"
          className={styles.sheetMascot}
        />
      </nav>
    </div>
  );
}

function FreezerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9h18l-1.5 11h-15z" />
      <path d="M7 9V6a5 5 0 0 1 10 0v3" />
    </svg>
  );
}
