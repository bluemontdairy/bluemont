import Image from 'next/image';
import styles from './ProductCard.module.css';
import { brandLabel, formatMrp } from '../lib/brands';
import { whatsappLink } from '../lib/site';

const FORMAT_COLORS = {
  Cones: 'var(--accent-orange)',
  Cups: 'var(--primary)',
  Bars: 'var(--accent-pink)',
  Sundaes: 'var(--brand-yellow-deep)',
  Packs: 'var(--accent-brown)',
  Bulk: '#333333',
  Sticks: 'var(--accent-pink)',
  Popsicles: 'var(--accent-orange)',
};

const FALLBACK_IMAGE = '/brand/logo/badge.webp';

export default function ProductCard({ product }) {
  const accentColor = FORMAT_COLORS[product.format] || 'var(--primary)';
  const size = [product.category, product.volume].filter(Boolean).join(' · ');
  const inquiry = whatsappLink(`Hi Blue Mont, I would like to stock ${product.name} in my store.`);

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper} style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}>
        <Image
          src={product.image || FALLBACK_IMAGE}
          alt={`${brandLabel(product.brand)} ${product.name}${product.volume ? ` ${product.volume}` : ''}`}
          fill
          sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 280px"
          className={`${styles.image} ${product.image ? '' : styles.fallback}`}
        />
        <span className={styles.formatBadge} style={{ backgroundColor: accentColor }}>
          {product.format}
        </span>
      </div>
      <div className={styles.content}>
        <p className={styles.brand}>{brandLabel(product.brand)}</p>
        <h3 className={styles.name}>{product.name}</h3>
        {size && <p className={styles.category}>{size}</p>}

        <div className={styles.footer}>
          <p className={styles.price}>
            {formatMrp(product.mrp)}
            {typeof product.mrp === 'number' && <span className={styles.mrpLabel}>MRP</span>}
          </p>
          <a href={inquiry} target="_blank" rel="noopener noreferrer" className={styles.inquireBtn}>
            Inquire Wholesale / Stock in Store
          </a>
        </div>
      </div>
    </article>
  );
}
