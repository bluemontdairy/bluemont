import ProductCatalog from '../../components/ProductCatalog';
import PageHero from '../../components/PageHero';
import styles from './page.module.css';
import { getPublicCatalog } from '../../lib/catalog';
import { getSiteInfo } from '../../lib/siteSettings';
import { getSiteMedia } from '../../lib/siteMedia';
import { jsonLd, pageSocial } from '../../lib/site';
import { breadcrumbJsonLd, productListJsonLd } from '../../lib/catalogJsonLd';

const TITLE = "Ice Cream & Kulfi Price List (MRP) — Baeley's, Blissberry & Top Kulfi";
const DESCRIPTION =
  "Full Blue Mont Dairy catalog with MRP in NPR: Baeley's cones, cups, sundaes, bars, 500 ml and 1 litre tubs and bulk tub boxes, Blissberry Kulfusion sticks and Top Kulfi. Wholesale supply across Nepal.";

export async function generateMetadata() {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/products' },
    ...pageSocial({
      title: "Ice Cream & Kulfi Price List — Baeley's, Blissberry & Top Kulfi",
      description: "MRP for every Baeley's, Blissberry and Top Kulfi pack, plus wholesale supply across Nepal.",
      path: '/products',
      media: await getSiteMedia(),
    }),
  };
}

export default async function ProductsPage({ searchParams }) {
  const { brand = '', format = '' } = await searchParams;
  const [{ categories, products }, media, info] = await Promise.all([getPublicCatalog(), getSiteMedia(), getSiteInfo()]);

  return (
    <div className={styles.page}>
      <PageHero eyebrow="Products & prices" title="Our ice cream & kulfi" mascot={media['hero.mascot-right']}>
        <p>
          {categories.map((c) => c.name).join(', ') || 'Ice cream and kulfi'} from Top Kulfi, Baeley&apos;s and
          Blissberry, with the MRP of every pack. Stocking a shop, café or canteen? Tap any product to ask our
          wholesale desk on WhatsApp.
        </p>
      </PageHero>

      <ProductCatalog
        products={products}
        categories={categories}
        fallbackImage={media['logo.badge'] || null}
        whatsapp={info.whatsapp}
        initialBrand={typeof brand === 'string' ? brand : ''}
        initialFormat={typeof format === 'string' ? format : ''}
      />

      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(productListJsonLd(products, categories, { name: 'Blue Mont Dairy product catalog', url: '/products', siteUrl: info.siteUrl })),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd([['Home', '/'], ['Products', '/products']], info.siteUrl)) }}
      />
    </div>
  );
}
