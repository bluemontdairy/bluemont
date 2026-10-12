import { getSiteUrl, isSecondaryHost } from '../lib/siteSettings';

// robots.txt. The real site lets every crawler in, including AI search
// (ChatGPT, Perplexity, Gemini), except the admin panel and the API. A copy
// served on another address (a *.vercel.app deployment) blocks everything,
// so only the real domain is indexed.
export default async function robots() {
  const siteUrl = await getSiteUrl();

  if (await isSecondaryHost(siteUrl)) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
