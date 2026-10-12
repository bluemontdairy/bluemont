// Fixed brand details and SEO helpers. Contact details, social links, the
// address and the like are editable in Admin → Site settings: read them with
// getSiteInfo() from lib/siteSettings.js. The values here are the defaults.

import { absoluteMediaUrl, cldTransform } from './media';

export const SITE = {
  name: 'Blue Mont Dairy',
  legalName: 'Blue Mont Dairy Pvt. Ltd.',
  tagline: "Ice cream & kulfi from Lalitpur, Nepal: Top Kulfi, Baeley's & Blissberry",
  description:
    "Blue Mont Dairy is a Lalitpur ice cream and kulfi maker with 20 years of heritage, making Top Kulfi, Baeley's ice cream and Blissberry Kulfusion. Premium quality at an honest price, sold in 12+ districts and cities across Nepal.",
  foundingYear: 2006, // TODO: confirm (scope says ~20 years of operation)
  phone: '',
  whatsapp: '',
  email: 'info@bluemont.com.np',
  address: {
    streetAddress: 'Lalitpur', // TODO: factory street address
    addressLocality: 'Lalitpur',
    addressRegion: 'Bagmati Province',
    postalCode: '44700',
    addressCountry: 'NP',
  },
  geo: { latitude: 27.6644, longitude: 85.3188 }, // TODO: exact factory pin
  areaServed: ['Lalitpur', 'Kathmandu', 'Bhaktapur'],
  social: ['https://instagram.com/bluemont_dairy'],
  brands: ['Top Kulfi', "Baeley's", 'Blissberry'],
};

const SHARE_ALT = 'Ice cream and kulfi by Blue Mont Dairy, Lalitpur';

/**
 * Open Graph image entry from the "share.image" site media slot (Admin →
 * Site images). Cloudinary crops it to 1200 × 630 as a JPEG, which every
 * social network accepts.
 */
export const shareImage = (media) => {
  const img = media?.['share.image'];
  if (!img) return [];
  const url = img.uploaded ? cldTransform(img.src, 'c_fill,g_auto,w_1200,h_630,f_jpg,q_auto') : img.src;
  return [{ url, width: 1200, height: 630, alt: SHARE_ALT }];
};

export const SEO_KEYWORDS = [
  'ice cream Nepal',
  'kulfi Nepal',
  'dairy manufacturer Nepal',
  'ice cream manufacturer Lalitpur',
  'ice cream wholesale Kathmandu',
  'ice cream supplier Bhaktapur',
  "Baeley's ice cream supplier",
  "Baeley's ice cream price",
  'Blissberry kulfusion',
  'Top Kulfi Nepal',
  'kulfi Kathmandu',
  'ice cream deep freezer for shop Nepal',
  'ice cream distributor Kathmandu Valley',
];

// Public routes listed in sitemap.xml. Add new public pages here.
export const PUBLIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/partner', changeFrequency: 'monthly', priority: 0.9 },
];

// Next.js replaces (doesn't merge) a parent's openGraph/twitter objects, so
// every page builds both through this helper to keep the share image.
// `media` is the result of getSiteMedia() (for the share image).
export const pageSocial = ({ title, description, path, media }) => {
  const images = shareImage(media);
  return {
    openGraph: {
      type: 'website',
      locale: 'en_NP',
      siteName: SITE.name,
      url: path,
      title,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  };
};

/** wa.me chat link; `number` comes from the site settings. */
export const whatsappLink = (message, number) =>
  `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

// Serialises JSON-LD for a <script> tag. Escaping "<" stops a product name
// containing "</script>" from breaking out of the tag.
export const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// `info` is getSiteInfo() (admin-editable details); `media` is getSiteMedia().
export const organizationJsonLd = (media, info) => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${info.siteUrl}/#organization`,
  name: SITE.name,
  legalName: info.legalName,
  description: SITE.description,
  url: info.siteUrl,
  logo: absoluteMediaUrl(media['logo.bluemont-tile']?.src, info.siteUrl),
  image: absoluteMediaUrl(shareImage(media)[0]?.url, info.siteUrl),
  ...(info.phone && { telephone: info.phone }),
  ...(info.email && { email: info.email }),
  foundingDate: String(info.foundingYear),
  address: { '@type': 'PostalAddress', ...info.address },
  geo: { '@type': 'GeoCoordinates', ...info.geo },
  areaServed: info.areaServed.map((name) => ({ '@type': 'City', name })),
  brand: SITE.brands.map((name) => ({ '@type': 'Brand', name })),
  sameAs: info.social,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(info.phone && { telephone: info.phone }),
      areaServed: 'NP',
      availableLanguage: ['en', 'ne'],
    },
  ],
});
