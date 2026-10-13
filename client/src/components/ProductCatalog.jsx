'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import styles from '../app/products/page.module.css';
import { brandLabel, formatLabel, sortBrands, sortFormats } from '../lib/brands';

// Filters run in the browser over the full catalog (a few dozen SKUs), so
// every product is in the server-rendered HTML for search engines.
// Categories are links to their own pages (/products/kulfi) rather than
// in-page filters, so each one can rank on its own.
//
// Desktop shows the filters as a sticky sidebar. Phones get a Sort | Filter
// bar under the header that opens bottom sheets: the filter sheet lists the
// groups down the left and the chosen group's options on the right.
const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

// Products without an MRP go last whichever way the list is sorted.
const byPrice = (dir) => (a, b) => {
  const pa = typeof a.mrp === 'number' ? a.mrp : null;
  const pb = typeof b.mrp === 'number' ? b.mrp : null;
  if (pa === null || pb === null) return (pa === null) - (pb === null);
  return dir === 'asc' ? pa - pb : pb - pa;
};

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

  const router = useRouter();
  const [sort, setSort] = useState('');
  // Which bottom sheet is open on phones: 'sort', 'filter' or ''.
  const [sheet, setSheet] = useState('');
  const [tab, setTab] = useState(categories.length > 1 ? 'category' : 'brand');

  const filtered = products.filter((p) => (!brand || p.brand === brand) && (!format || p.format === format));
  const visible = sort ? [...filtered].sort(byPrice(sort === 'price-asc' ? 'asc' : 'desc')) : filtered;
  const activeCount = (activeCategory ? 1 : 0) + (brand ? 1 : 0) + (format ? 1 : 0);

  // Lock page scroll behind an open sheet; Escape closes it.
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e) => e.key === 'Escape' && setSheet('');
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [sheet]);

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

  const clearFilters = () => {
    setBrand('');
    setFormat('');
    sync('', '');
  };

  // The sheet's Reset also drops the category, which is its own page.
  const resetAll = () => {
    if (activeCategory) router.push('/products');
    else clearFilters();
  };

  const chip = (active) => `${styles.filterBtn} ${active ? styles.active : ''}`;
  const option = (active) => `${styles.sheetOption} ${active ? styles.sheetOptionActive : ''}`;
  const sortLabel = SORTS.find((o) => o.value === sort).label;

  const tabs = [
    categories.length > 1 && { id: 'category', label: 'Category', active: !!activeCategory },
    { id: 'brand', label: 'Brand', active: !!brand },
    { id: 'format', label: 'Format', active: !!format },
  ].filter(Boolean);

  return (
    <div className={`container ${styles.catalogContainer}`}>
      <div className={styles.mobileBar}>
        <button type="button" className={styles.mobileBarBtn} onClick={() => setSheet('sort')} aria-haspopup="dialog">
          <SortIcon />
          <span>
            <strong>Sort</strong>
            <small>{sortLabel}</small>
          </span>
        </button>
        <button type="button" className={styles.mobileBarBtn} onClick={() => setSheet('filter')} aria-haspopup="dialog">
          <FilterIcon />
          <span>
            <strong>Filter{activeCount > 0 && <em className={styles.badge}>{activeCount}</em>}</strong>
            <small>{activeCount ? `${activeCount} applied` : 'All products'}</small>
          </span>
        </button>
      </div>

      <div className={`${styles.backdrop} ${sheet ? styles.backdropOpen : ''}`} onClick={() => setSheet('')} aria-hidden="true" />

      <div
        className={`${styles.sheet} ${sheet === 'sort' ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-sort"
        hidden={sheet !== 'sort'}
      >
        <div className={styles.sheetHead}>
          <h2 id="sheet-sort">Sort by</h2>
          <button type="button" className={styles.sheetClose} onClick={() => setSheet('')} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className={styles.sortList}>
          {SORTS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={option(sort === o.value)}
              aria-pressed={sort === o.value}
              onClick={() => {
                setSort(o.value);
                setSheet('');
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${styles.sheet} ${sheet === 'filter' ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-filter"
        hidden={sheet !== 'filter'}
      >
        <div className={styles.sheetHead}>
          <h2 id="sheet-filter">Filter</h2>
          <button type="button" className={styles.sheetClose} onClick={() => setSheet('')} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.sheetBody}>
          <div className={styles.sheetTabs} role="tablist" aria-orientation="vertical">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`${styles.sheetTab} ${tab === t.id ? styles.sheetTabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.active && <span className={styles.dot} aria-label="(applied)" />}
              </button>
            ))}
          </div>

          <div className={styles.sheetOptions} role="tabpanel">
            {tab === 'category' && (
              <>
                <Link href="/products" className={option(!activeCategory)} aria-current={!activeCategory ? 'page' : undefined}>
                  Everything
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/products/${c.slug}`}
                    className={option(activeCategory === c.slug)}
                    aria-current={activeCategory === c.slug ? 'page' : undefined}
                  >
                    {c.name}
                  </Link>
                ))}
              </>
            )}
            {tab === 'brand' && (
              <>
                <button type="button" className={option(!brand)} aria-pressed={!brand} onClick={() => pickBrand('')}>
                  All brands
                </button>
                {brands.map((b) => (
                  <button key={b} type="button" className={option(brand === b)} aria-pressed={brand === b} onClick={() => pickBrand(b)}>
                    {brandLabel(b)}
                  </button>
                ))}
              </>
            )}
            {tab === 'format' && (
              <>
                <button type="button" className={option(!format)} aria-pressed={!format} onClick={() => pickFormat('')}>
                  All formats
                </button>
                {formats.map((f) => (
                  <button key={f} type="button" className={option(format === f)} aria-pressed={format === f} onClick={() => pickFormat(f)}>
                    {formatLabel(f)}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className={styles.sheetFoot}>
          <button type="button" className={styles.resetBtn} onClick={resetAll} disabled={!activeCount}>
            Reset
          </button>
          <button type="button" className={styles.doneBtn} onClick={() => setSheet('')}>
            Show {visible.length} {visible.length === 1 ? 'product' : 'products'}
          </button>
        </div>
      </div>

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
        <div className={styles.resultsRow}>
          <p className={styles.resultsHeader} aria-live="polite">
            Showing {visible.length} {visible.length === 1 ? 'product' : 'products'} · prices are MRP in NPR
          </p>
          <label className={styles.sortSelect}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

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
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
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

const SortIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h10M3 12h7M3 18h4M17 4v16M17 20l-3.5-3.5M17 20l3.5-3.5" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
