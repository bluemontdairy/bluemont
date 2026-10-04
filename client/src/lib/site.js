// Single source of truth for business details used by SEO tags, JSON-LD,
// the footer and the WhatsApp links. Values marked TODO are placeholders
// until Blue Mont confirms them; override any of them through env vars.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bluemont.com.np').replace(/\/$/, '');

export const SITE = {
  name: 'Blue Mont Dairy',
  legalName: 'Blue Mont Dairy Pvt. Ltd.',
  tagline: "Baeley's, Blissberry & Top Kulfi ice cream from Lalitpur, Nepal",
  description:
    "Blue Mont Dairy is a Lalitpur ice cream and dairy manufacturer with 20 years of heritage, making Baeley's, Blissberry and Top Kulfi. Wholesale supply and branded deep freezers for shops, cafes and canteens across Kathmandu, Lalitpur and Bhaktapur.",
  foundingYear: 2006, // TODO: confirm (scope says ~20 years of operation)
  // TODO: confirm the real numbers and email before launch.
  phone: process.env.NEXT_PUBLIC_SALES_PHONE || '+977-1-0000000',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9770000000000',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@bluemont.com.np',
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
  brands: ["Baeley's", 'Blissberry', 'Top Kulfi'],
  ogImage: '/og.jpg',
};

export const SEO_KEYWORDS = [
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

export const whatsappLink = (message) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

// Serialises JSON-LD for a <script> tag. Escaping "<" stops a product name
// containing "</script>" from breaking out of the tag.
export const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  description: SITE.description,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo/badge.webp`,
  image: `${SITE_URL}${SITE.ogImage}`,
  telephone: SITE.phone,
  email: SITE.email,
  foundingDate: String(SITE.foundingYear),
  address: { '@type': 'PostalAddress', ...SITE.address },
  geo: { '@type': 'GeoCoordinates', ...SITE.geo },
  areaServed: SITE.areaServed.map((name) => ({ '@type': 'City', name })),
  brand: SITE.brands.map((name) => ({ '@type': 'Brand', name })),
  sameAs: SITE.social,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: SITE.phone,
      areaServed: 'NP',
      availableLanguage: ['en', 'ne'],
    },
  ],
});
