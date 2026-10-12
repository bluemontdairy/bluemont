import SiteImage from './SiteImage';
import styles from './PageHero.module.css';

// Blue header band for inner pages (products, categories, partner), in the
// homepage's style: eyebrow, chunky uppercase title, short intro and an
// optional mascot. It runs up under the fixed header.
export default function PageHero({ eyebrow, title, children, mascot }) {
  return (
    <header className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {children && <div className={styles.intro}>{children}</div>}
        </div>
        <SiteImage media={mascot} aria-hidden="true" sizes="200px" className={styles.mascot} />
      </div>
    </header>
  );
}
