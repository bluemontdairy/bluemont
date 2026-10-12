import { getSiteUrl } from '../lib/siteSettings';

export default async function robots() {
  const siteUrl = await getSiteUrl();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
