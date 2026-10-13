import Link from 'next/link';
import Image from 'next/image';
import SiteImage from './SiteImage';
import { telHref } from '../lib/settingsSchema';
import styles from './Footer.module.css';

const EXPLORE = [
  { href: '/products', label: 'All products' },
  { href: '/#brands', label: 'Our brands' },
  { href: '/#top-kulfi', label: 'Top Kulfi' },
  { href: '/#quality', label: 'Quality & food safety' },
  { href: '/partner', label: 'Freezer placement' },
];

const BRANDS = [
  { slug: 'topkulfi', label: 'Top Kulfi', note: 'Kulfi & popsicles' },
  { slug: 'baeleys', label: "Baeley's", note: 'Ice cream' },
  { slug: 'blissberry', label: 'Blissberry', note: 'Kulfusion' },
];

// Social icons, in display order. Each shows only when its link is set in
// Admin → Site settings.
const SOCIAL_ICONS = {
  instagram: {
    label: 'Instagram',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>,
  },
  facebook: {
    label: 'Facebook',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" /></svg>,
  },
  tiktok: {
    label: 'TikTok',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.6-2.6 6.1-6 6.1a6 6 0 0 1-6-6c0-3.6 3-6.2 6.7-5.9v3.2c-1.7-.3-3.4.9-3.4 2.7 0 1.6 1.2 2.8 2.7 2.8 1.6 0 2.8-1.1 2.8-3V3h3.2z" /></svg>,
  },
  youtube: {
    label: 'YouTube',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>,
  },
};

// `info` is getSiteInfo(): contact details and links from Admin → Site settings.
export default function Footer({ logo, mascot, info }) {
  return (
    <footer id="contact" className={styles.footer}>
      <SiteImage
        media={mascot}
        aria-hidden="true"
        sizes="150px"
        className={styles.peek}
      />
      <SiteImage
        media={logo}
        aria-hidden="true"
        sizes="520px"
        className={styles.watermark}
      />

      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brandSection}>
          <SiteImage
            media={logo}
            alt="Blue Mont Dairy"
            sizes="(max-width: 768px) 60vw, 280px"
            className={styles.wordmark}
          />
          <p className={styles.tagline}>
            Ice cream and kulfi from Lalitpur, made by Blue Mont Dairy for about {info.stats.years} years.
          </p>
          <div className={styles.social}>
            {Object.entries(SOCIAL_ICONS).map(([key, { label, icon }]) =>
              info.socials[key] ? (
                <a key={key} href={info.socials[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {icon}
                </a>
              ) : null
            )}
            {info.email && (
              <a href={`mailto:${info.email}`} aria-label="Email">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
              </a>
            )}
          </div>
        </div>

        <div className={styles.col}>
          <h3>Explore</h3>
          <ul>
            {EXPLORE.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Our brands</h3>
          <ul>
            {BRANDS.map((b) => (
              <li key={b.slug}>
                <Link href={`/products?brand=${b.slug}`}>
                  <span className={styles.brandName}>{b.label}</span>
                  <span className={styles.brandNote}>{b.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Say hello</h3>
          <ul>
            {info.addressLine && (
              <li>
                {info.mapUrl ? (
                  <a href={info.mapUrl} target="_blank" rel="noopener noreferrer">{info.addressLine}</a>
                ) : (
                  info.addressLine
                )}
              </li>
            )}
            {info.openingHours && <li>{info.openingHours}</li>}
            {info.phone && <li><a href={telHref(info.phone)}>{info.phone}</a></li>}
            {info.email && <li><a href={`mailto:${info.email}`}>{info.email}</a></li>}
          </ul>
          <Link href="/partner" className={styles.footerCta}>Become a stockist</Link>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <p>&copy; {new Date().getFullYear()} {info.legalName}. All rights reserved.</p>
        <a href="https://www.siggold.com" target="_blank" rel="noopener" className={styles.madeBy}>
          Made by
          <Image src="/brand/siggold-mark.svg" alt="" width={18} height={18} className={styles.madeByMark} unoptimized />
          <span>Siggold</span>
        </a>
        <a href="#top" className={styles.toTop}>
          Back to top
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 15 L12 8 L19 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
    </footer>
  );
}
