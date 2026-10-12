import { PUBLIC_ROUTES, SHARE_IMAGES } from '../lib/site';
import { getSiteUrl } from '../lib/siteSettings';
import { getPublicCatalog } from '../lib/catalog';
import { cldTransform } from '../lib/media';

// sitemap.xml: every public page, with real change dates (from the catalog)
// and the product photos on each page, so Google Images can list them.
export default async function sitemap() {
  const [{ categories, products }, siteUrl] = await Promise.all([getPublicCatalog(), getSiteUrl()]);

  const absolute = (src) => (/^https?:\/\//.test(src) ? src : `${siteUrl}${src}`);
  const photo = (p) => absolute(cldTransform(p.image, 'f_jpg,q_auto,w_1200,c_limit'));
  const latest = (items) => {
    const times = items.map((i) => Date.parse(i.updatedAt)).filter(Number.isFinite);
    return times.length ? new Date(Math.max(...times)) : undefined;
  };
  const withPhoto = products.filter((p) => p.image);
  const catalogUpdated = latest([...products, ...categories]);

  const entry = (path, { changeFrequency, priority, lastModified, images = [] }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    ...(lastModified && { lastModified }),
    changeFrequency,
    priority,
    ...(images.length && { images }),
  });

  const pages = PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => {
    if (path === '/products') {
      return entry(path, { changeFrequency, priority, lastModified: catalogUpdated, images: withPhoto.map(photo) });
    }
    if (path === '/') {
      return entry(path, { changeFrequency, priority, lastModified: catalogUpdated, images: [absolute(SHARE_IMAGES.home.url)] });
    }
    return entry(path, { changeFrequency, priority });
  });

  const categoryPages = categories.map((c) => {
    const inCategory = products.filter((p) => p.categoryId === c._id);
    return entry(`/products/${c.slug}`, {
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: latest([c, ...inCategory]),
      images: inCategory.filter((p) => p.image).map(photo),
    });
  });

  return [...pages, ...categoryPages];
}
