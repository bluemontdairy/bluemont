import { notFound } from 'next/navigation';
import ProductCatalog from '../../../components/ProductCatalog';
import PageHero from '../../../components/PageHero';
import styles from '../page.module.css';
import { getPublicCatalog } from '../../../lib/catalog';
import { getSiteInfo } from '../../../lib/siteSettings';
import { getSiteMedia } from '../../../lib/siteMedia';
import { jsonLd, pageSocial } from '../../../lib/site';
import { breadcrumbJsonLd, productListJsonLd } from '../../../lib/catalogJsonLd';

// One page per category (/products/ice-cream, /products/kulfi...), each with
// its own title, description and structured data.

const findCategory = async (slug) => {
  const catalog = await getPublicCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  return { ...catalog, category };
};

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) return { title: 'Not found', robots: { index: false } };

  const title = category.seoTitle || `${category.name} Prices in Nepal (MRP)`;
  const description =
    category.seoDescription ||
    category.description.slice(0, 160) ||
    `${category.name} from Top Kulfi, Baeley's and Blissberry by Blue Mont Dairy, with the MRP of every pack and wholesale supply for shops.`;
  return {
    title: { absolute: `${title} | Blue Mont Dairy` },
    description,
    alternates: { canonical: `/products/${category.slug}` },
    ...pageSocial({ title: `${title} | Blue Mont Dairy`, description, path: `/products/${category.slug}`, media: await getSiteMedia(), image: 'products' }),
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category: slug } = await params;
  const { brand = '', format = '' } = await searchParams;
  const [{ categories, products, category }, media, info] = await Promise.all([findCategory(slug), getSiteMedia(), getSiteInfo()]);
  if (!category) notFound();

  const inCategory = products.filter((p) => p.categoryId === category._id);
  const path = `/products/${category.slug}`;

  return (
    <div className={styles.page}>
      <PageHero eyebrow="Products & prices" title={category.name} mascot={media['hero.mascot-right']}>
        {category.description && <p>{category.description}</p>}
      </PageHero>

      <ProductCatalog
        products={inCategory}
        categories={categories}
        activeCategory={category.slug}
        fallbackImage={media['logo.badge'] || null}
        whatsapp={info.whatsapp}
        initialBrand={typeof brand === 'string' ? brand : ''}
        initialFormat={typeof format === 'string' ? format : ''}
      />

      {inCategory.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(productListJsonLd(inCategory, categories, { name: `${category.name} by Blue Mont Dairy`, url: path, siteUrl: info.siteUrl })),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbJsonLd([['Home', '/'], ['Products', '/products'], [category.name, path]], info.siteUrl)),
        }}
      />
    </div>
  );
}
