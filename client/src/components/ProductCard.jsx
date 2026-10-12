import Image from 'next/image';
import styles from './ProductCard.module.css';
import { brandLabel, formatMrp } from '../lib/brands';
import { whatsappLink } from '../lib/site';
import { formatAttributeValue } from '../lib/categorySchema';

const FORMAT_COLORS = {
  Cones: 'var(--accent-orange)',
  Cups: 'var(--primary)',
  Bars: 'var(--accent-pink)',
  Sundaes: 'var(--brand-yellow-deep)',
  Packs: 'var(--primary-dark)',
  Bulk: 'var(--ink)',
  Sticks: 'var(--accent-pink)',
  Popsicles: 'var(--accent-orange)',
  Kulfi: 'var(--brand-yellow-deep)',
};

// `fallback` is the badge site image, shown until the product has a photo.
// `fields` are the category's attribute definitions; the ones marked
// "show on card" are listed under the name.
export default function ProductCard({ product, fallback, fields = [], whatsapp }) {
  const accentColor = FORMAT_COLORS[product.format] || 'var(--primary)';
  const size = [product.category?.name, product.line, product.volume].filter(Boolean).join(' · ');
  const facts = fields
    .filter((f) => f.showOnCard)
    .map((f) => [f.label, formatAttributeValue(f, product.attributes?.[f.key])])
    .filter(([, v]) => v);
  const src = product.image || fallback?.src;
  const inquiry = whatsappLink(`Hi Blue Mont, I would like to stock ${product.name} in my store.`, whatsapp);

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper} style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}>
        {src && (
          <Image
            src={src}
            alt={`${brandLabel(product.brand)} ${product.name}${product.volume ? ` ${product.volume}` : ''}`}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 280px"
            className={`${styles.image} ${product.image ? '' : styles.fallback}`}
          />
        )}
        <span className={styles.formatBadge} style={{ backgroundColor: accentColor }}>
          {product.format}
        </span>
      </div>
      <div className={styles.content}>
        <p className={styles.brand}>{brandLabel(product.brand)}</p>
        <h3 className={styles.name}>{product.name}</h3>
        {size && <p className={styles.category}>{size}</p>}
        {facts.length > 0 && (
          <p className={styles.category}>
            {facts.map(([label, value]) => `${label}: ${value}`).join(' · ')}
          </p>
        )}

        <div className={styles.footer}>
          <p className={styles.price}>
            {formatMrp(product.mrp)}
            {typeof product.mrp === 'number' && <span className={styles.mrpLabel}>MRP</span>}
          </p>
          <a
            href={inquiry}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inquireBtn}
            aria-label={`Ask about stocking ${product.name} in your store, on WhatsApp`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3c.2-.4.2-.9.1-1-.1-.1-.2-.1-.5-.3z" />
            </svg>
            Stock this
          </a>
        </div>
      </div>
    </article>
  );
}
