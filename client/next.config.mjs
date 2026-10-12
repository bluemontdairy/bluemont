/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev-only "N" badge: bottom-right keeps it clear of the admin account
  // menu (bottom-left of the sidebar on desktop, top-right on phones).
  devIndicators: { position: 'bottom-right' },
  images: {
    // Product photos and site images live on Cloudinary, which resizes and
    // converts them on its CDN (see src/lib/imageLoader.js).
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js',
  },
  async headers() {
    const noStore = { key: 'Cache-Control', value: 'no-store, max-age=0' };
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          noStore,
        ],
      },
      { source: '/api/auth/:path*', headers: [noStore] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Last, so it overrides the site-wide Referrer-Policy above. The reset
      // token is in the URL fragment; never leak this page's URL.
      { source: '/admin/reset-password', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
    ];
  },
};

export default nextConfig;
