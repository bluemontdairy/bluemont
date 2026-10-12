// schema.org structured data for the catalog pages: an ItemList of Product
// entries (with each category's own fields as additionalProperty), and a
// breadcrumb trail. Helps Google and AI search read the range per category.

import { brandLabel } from './brands';
import { formatAttributeValue } from './categorySchema';
import { absoluteMediaUrl, cldTransform } from './media';

const productJsonLd = (p, fields, siteUrl) => {
  const properties = (fields || [])
    .map((f) => ({ f, value: formatAttributeValue(f, p.attributes?.[f.key]) }))
    .filter(({ value }) => value)
    .map(({ f, value }) => ({ '@type': 'PropertyValue', name: f.label, value }));

  return {
    '@type': 'Product',
    name: `${brandLabel(p.brand)} ${p.name}`,
    category: [p.category?.name, p.line].filter(Boolean).join(' > '),
    brand: { '@type': 'Brand', name: brandLabel(p.brand) },
    manufacturer: { '@id': `${siteUrl}/#organization` },
    ...(p.description && { description: p.description }),
    ...(p.image && { image: absoluteMediaUrl(cldTransform(p.image, 'f_auto,q_auto,w_800,c_limit'), siteUrl) }),
    ...(p.volume && { size: p.volume }),
    ...(properties.length && { additionalProperty: properties }),
    ...(typeof p.mrp === 'number' && {
      offers: {
        '@type': 'Offer',
        price: p.mrp,
        priceCurrency: 'NPR',
        availability: 'https://schema.org/InStock',
        areaServed: 'NP',
      },
    }),
  };
};

/** ItemList for a set of products. `categories` supplies each one's fields. */
export function productListJsonLd(products, categories, { name, url, siteUrl }) {
  const fields = new Map(categories.map((c) => [c._id, c.attributes]));
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${siteUrl}${url}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productJsonLd(p, fields.get(p.categoryId), siteUrl),
    })),
  };
}

/** BreadcrumbList from [name, path] pairs. */
export const breadcrumbJsonLd = (trail, siteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: `${siteUrl}${path}`,
  })),
});
