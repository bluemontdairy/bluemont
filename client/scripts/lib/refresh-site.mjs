// Asks the running website to drop its cached catalog, images and settings
// after a script changed the database. Tries the local dev server and the
// site address from Site settings; whichever isn't running is skipped.
// Call before mongoose.disconnect().

import SiteSettings from '../../src/models/SiteSettings.js';

export async function refreshSite() {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) return;
  const siteUrl = (await SiteSettings.findById('site').lean())?.values?.siteUrl;
  const urls = [...new Set(['http://localhost:3000', siteUrl].filter(Boolean))];
  for (const base of urls) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': secret },
        signal: AbortSignal.timeout(8000),
      });
      console.log(res.ok ? `Refreshed ${base}.` : `Could not refresh ${base} (HTTP ${res.status}).`);
    } catch {
      // not running
    }
  }
}
