import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const EXPLORE = [
  { href: '/products', label: 'All products' },
  { href: '/#story', label: 'Our story' },
  { href: '/#quality', label: 'Quality & food safety' },
  { href: '/partner', label: 'Freezer placement' },
];

const BRANDS = [
  { label: "Baeley's", note: 'Monster-sized treats' },
  { label: 'Blissberry', note: 'Kulfusion sticks' },
  { label: 'Top Kulfi', note: 'Khuwa kulfi & popsicles' },
];

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <Image
        src="/brand/mascots/yeti-wave.webp"
        alt=""
        aria-hidden="true"
        width={840}
        height={900}
        sizes="150px"
        className={styles.peek}
      />
      <Image
        src="/brand/logo/badge.webp"
        alt=""
        aria-hidden="true"
        width={600}
        height={600}
        sizes="520px"
        className={styles.watermark}
      />

      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brandSection}>
          <Image
            src="/brand/logo/wordmark.webp"
            alt="Baeley's"
            width={960}
            height={440}
            sizes="(max-width: 768px) 60vw, 280px"
            className={styles.wordmark}
          />
          <p className={styles.tagline}>
            The sweet taste of life, churned in Lalitpur by Blue Mont Dairy for about 20 years.
          </p>
          <div className={styles.social}>
            <a href="https://instagram.com/bluemont_dairy" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" /></svg>
            </a>
            <a href="mailto:info@bluemont.com.np" aria-label="Email">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
            </a>
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
              <li key={b.label}>
                <span className={styles.brandName}>{b.label}</span>
                <span className={styles.brandNote}>{b.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Say hello</h3>
          <ul>
            <li>Lalitpur, Kathmandu Valley, Nepal</li>
            <li><a href="tel:+977XXXXXXXXXX">+977 XXXXXXXXXX</a></li>
            <li><a href="mailto:info@bluemont.com.np">info@bluemont.com.np</a></li>
          </ul>
          <Link href="/partner" className={styles.footerCta}>Become a stockist</Link>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <p>&copy; {new Date().getFullYear()} Blue Mont Dairy Pvt. Ltd. All rights reserved.</p>
        <a href="#top" className={styles.toTop}>
          Back to top
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 15 L12 8 L19 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
    </footer>
  );
}
