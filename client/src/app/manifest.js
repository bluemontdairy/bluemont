import { SITE } from '../lib/site';

// Web app manifest: what Android shows for "Add to home screen", the install
// prompt and the splash screen. Icons come from scripts/generate-brand-assets.mjs.
export default function manifest() {
  return {
    id: '/',
    name: SITE.name,
    short_name: 'Blue Mont',
    description: SITE.description,
    lang: 'en-NP',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // The splash screen is the brand blue with the badge in the middle.
    background_color: '#2D6BB2',
    theme_color: '#2D6BB2',
    categories: ['food', 'shopping', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Long-press the home screen icon for these.
    shortcuts: [
      {
        name: 'Products & prices',
        short_name: 'Products',
        url: '/products',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Stock Blue Mont in your shop',
        short_name: 'Become a partner',
        url: '/partner',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
