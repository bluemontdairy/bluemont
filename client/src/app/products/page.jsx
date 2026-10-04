import ProductCatalog from '../../components/ProductCatalog';
import styles from './page.module.css';
import { getActiveProducts } from '../../lib/catalog';
import { brandLabel } from '../../lib/brands';
import { SITE_URL, jsonLd, pageSocial } from '../../lib/site';

export const metadata = {
  title: "Ice Cream Price List (MRP) — Baeley's, Blissberry & Top Kulfi",
  description:
    "Full Blue Mont Dairy catalog with MRP in NPR: Baeley's cones, cups, sundaes, bars, 500 ml and 1 litre tubs and bulk tub boxes, Blissberry Kulfusion sticks and Top Kulfi. Wholesale supply across Kathmandu, Lalitpur and Bhaktapur.",
  alternates: { canonical: '/products' },
  ...pageSocial({
    title: "Ice Cream Price List — Baeley's, Blissberry & Top Kulfi",
    description: "MRP for every Baeley's, Blissberry and Top Kulfi pack, plus wholesale supply across Kathmandu Valley.",
    path: '/products',
  }),
};

const productListJsonLd = (products) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Blue Mont Dairy product catalog',
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: `${brandLabel(p.brand)} ${p.name}`,
      category: [p.format, p.category].filter(Boolean).join(' / '),
      brand: { '@type': 'Brand', name: brandLabel(p.brand) },
      manufacturer: { '@id': `${SITE_URL}/#organization` },
      ...(p.image && { image: p.image.startsWith('http') ? p.image : `${SITE_URL}${p.image}` }),
      ...(p.volume && { size: p.volume }),
      ...(typeof p.mrp === 'number' && {
        offers: {
          '@type': 'Offer',
          price: p.mrp,
          priceCurrency: 'NPR',
          availability: 'https://schema.org/InStock',
          areaServed: 'Kathmandu Valley',
        },
      }),
    },
  })),
});

export default async function ProductsPage({ searchParams }) {
  const { brand = '', format = '' } = await searchParams;

  let products = [];
  try {
    products = await getActiveProducts();
  } catch (error) {
    console.error('Failed to load products', error);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Collection</h1>
          <p className={styles.subtitle}>
            Baeley&apos;s, Blissberry and Top Kulfi, with MRP for every pack. Stocking a shop, cafe or canteen? Tap
            any product to ask our wholesale desk on WhatsApp.
          </p>
        </div>
      </header>

      <ProductCatalog
        products={products}
        initialBrand={typeof brand === 'string' ? brand : ''}
        initialFormat={typeof format === 'string' ? format : ''}
      />

      {products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productListJsonLd(products)) }} />
      )}
    </div>
  );
}
