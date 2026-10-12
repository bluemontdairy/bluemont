import { PUBLIC_ROUTES } from '../lib/site';
import { getSiteUrl } from '../lib/siteSettings';
import { getPublicCatalog } from '../lib/catalog';

export default async function sitemap() {
  const lastModified = new Date();
  const [{ categories }, siteUrl] = await Promise.all([getPublicCatalog(), getSiteUrl()]);
  const routes = [
    ...PUBLIC_ROUTES,
    ...categories.map((c) => ({ path: `/products/${c.slug}`, changeFrequency: 'weekly', priority: 0.8 })),
  ];
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
