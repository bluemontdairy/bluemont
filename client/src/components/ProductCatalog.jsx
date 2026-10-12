'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import styles from '../app/products/page.module.css';
import { brandLabel, formatLabel, sortBrands, sortFormats } from '../lib/brands';

// Filters run in the browser over the full catalog (a few dozen SKUs), so
// every product is in the server-rendered HTML for search engines.
// Categories are links to their own pages (/products/kulfi) rather than
// in-page filters, so each one can rank on its own.
export default function ProductCatalog({
  products,
  categories = [],
  activeCategory = '',
  fallbackImage = null,
  whatsapp,
  initialBrand = '',
  initialFormat = '',
}) {
  const fieldsByCategory = useMemo(() => new Map(categories.map((c) => [c._id, c.attributes])), [categories]);
  const brands = useMemo(() => sortBrands([...new Set(products.map((p) => p.brand))]), [products]);
  const formats = useMemo(() => sortFormats([...new Set(products.map((p) => p.format))]), [products]);

  const [brand, setBrand] = useState(brands.includes(initialBrand) ? initialBrand : '');
  const [format, setFormat] = useState(formats.includes(initialFormat) ? initialFormat : '');

  const visible = products.filter((p) => (!brand || p.brand === brand) && (!format || p.format === format));

  // Keep the URL shareable (?brand=blissberry) without a navigation.
  const sync = (nextBrand, nextFormat) => {
    const params = new URLSearchParams();
    if (nextBrand) params.set('brand', nextBrand);
    if (nextFormat) params.set('format', nextFormat);
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  };

  const pickBrand = (value) => {
    setBrand(value);
    sync(value, format);
  };
  const pickFormat = (value) => {
    setFormat(value);
    sync(brand, value);
  };

  const chip = (active) => `${styles.filterBtn} ${active ? styles.active : ''}`;

  return (
    <div className={`container ${styles.catalogContainer}`}>
      <aside className={styles.sidebar} aria-label="Filter products">
        {categories.length > 1 && (
          <nav className={styles.filterGroup} aria-labelledby="filter-category">
            <h2 id="filter-category" className={styles.filterTitle}>Category</h2>
            <div className={styles.chips}>
              <Link href="/products" className={chip(!activeCategory)} aria-current={!activeCategory ? 'page' : undefined}>
                Everything
              </Link>
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/products/${c.slug}`}
                  className={chip(activeCategory === c.slug)}
                  aria-current={activeCategory === c.slug ? 'page' : undefined}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <div className={styles.filterGroup} role="group" aria-labelledby="filter-brand">
          <h2 id="filter-brand" className={styles.filterTitle}>Brand</h2>
          <div className={styles.chips}>
            <button type="button" className={chip(!brand)} aria-pressed={!brand} onClick={() => pickBrand('')}>
              All brands
            </button>
            {brands.map((b) => (
              <button key={b} type="button" className={chip(brand === b)} aria-pressed={brand === b} onClick={() => pickBrand(b)}>
                {brandLabel(b)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup} role="group" aria-labelledby="filter-format">
          <h2 id="filter-format" className={styles.filterTitle}>Format</h2>
          <div className={styles.chips}>
            <button type="button" className={chip(!format)} aria-pressed={!format} onClick={() => pickFormat('')}>
              All formats
            </button>
            {formats.map((f) => (
              <button key={f} type="button" className={chip(format === f)} aria-pressed={format === f} onClick={() => pickFormat(f)}>
                {formatLabel(f)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <p className={styles.resultsHeader} aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? 'product' : 'products'} · prices are MRP in NPR
        </p>

        {visible.length > 0 ? (
          <div className={styles.grid}>
            {visible.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                fallback={fallbackImage}
                fields={fieldsByCategory.get(product.categoryId)}
                whatsapp={whatsapp}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>{products.length ? 'No products match these filters.' : 'The catalog is being updated. Please check back soon.'}</p>
            {products.length > 0 && (
              <button type="button" className="btn btn-primary" onClick={() => { pickBrand(''); setFormat(''); sync('', ''); }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {!brand && !activeCategory && (
          <aside className={styles.comingSoon}>
            <p className={styles.comingSoonTag}>Coming soon</p>
            <h2>Fresh Dairy from Blue Mont</h2>
            <p>Curd, yogurt, mozzarella and cooking cream from our Lalitpur plant are on the way.</p>
          </aside>
        )}
      </div>
    </div>
  );
}
