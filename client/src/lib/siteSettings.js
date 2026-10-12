import 'server-only';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import connectDB from './db';
import SiteSettings from '../models/SiteSettings';
import { SITE } from './site';
import { resolveSettings, SETTINGS_KEYS } from './settingsSchema';

export const SETTINGS_TAG = 'site-settings';

const loadStored = unstable_cache(
  async () => {
    await connectDB();
    const doc = await SiteSettings.findById('site').lean();
    return doc?.values || {};
  },
  ['site-settings-v1'],
  { tags: [SETTINGS_TAG], revalidate: 3600 }
);

/** Raw stored values (only what an admin has set). */
export async function getStoredSettings() {
  try {
    const stored = await loadStored();
    return Object.fromEntries(Object.entries(stored).filter(([k]) => SETTINGS_KEYS.has(k)));
  } catch (error) {
    // The site still renders with defaults if the database is down.
    console.error('Failed to load site settings', error?.message);
    return {};
  }
}

/** Every non-secret setting with defaults filled in: { key: value }. */
export async function getSettings() {
  return resolveSettings(await getStoredSettings());
}

/**
 * The site's public address (no trailing slash), from Site settings. Until an
 * admin sets it, the address the current request came in on is used.
 */
export async function getSiteUrl(stored) {
  const set = (stored || (await getStoredSettings())).siteUrl;
  if (set) return set.replace(/\/$/, '');
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    if (host) return `${h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')}://${host}`;
  } catch {
    // outside a request (e.g. at build time)
  }
  return 'http://localhost:3000';
}

// A sender like "Blue Mont Website" <x@y> can lose its address when read
// from .env (the quoted part is taken alone); fall back to name <username>.
const sender = (from, user) => {
  const value = (from || '').trim();
  if (!value) return user;
  if (value.includes('@')) return value;
  return user ? `"${value.replace(/"/g, '')}" <${user}>` : '';
};

/**
 * Server-only connection details. Never pass this object to a client
 * component or an API response.
 *
 * Mail server and Cloudinary credentials come from .env (SMTP_*,
 * CLOUDINARY_*); the notification addresses come from Site settings.
 */
export async function getPrivateConfig() {
  const env = process.env;
  const stored = await getStoredSettings();
  const s = resolveSettings(stored);
  return {
    smtp: {
      host: env.SMTP_HOST || '',
      port: Number(env.SMTP_PORT) || 465,
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
      from: sender(env.SMTP_FROM, env.SMTP_USER),
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: env.CLOUDINARY_API_KEY || '',
      apiSecret: env.CLOUDINARY_API_SECRET || '',
      folder: env.CLOUDINARY_FOLDER || 'bluemont',
    },
    notifyEmails: s.notifyEmails,
  };
}

/**
 * Business details in the shape of lib/site.js's SITE, with admin settings
 * applied. Use this (not SITE) for anything an admin can change.
 */
export async function getSiteInfo() {
  const stored = await getStoredSettings();
  const s = resolveSettings(stored);
  const siteUrl = await getSiteUrl(stored);
  const socials = {
    instagram: s.instagramUrl,
    facebook: s.facebookUrl,
    tiktok: s.tiktokUrl,
    youtube: s.youtubeUrl,
  };
  return {
    ...SITE,
    siteUrl,
    legalName: s.legalName,
    foundingYear: Number(s.foundingYear) || SITE.foundingYear,
    phone: s.phone,
    whatsapp: s.whatsappNumber,
    whatsappMessage: s.whatsappMessage,
    email: s.email,
    addressLine: s.addressLine,
    mapUrl: s.mapUrl,
    openingHours: s.openingHours,
    address: {
      ...SITE.address,
      streetAddress: s.streetAddress,
      addressLocality: s.locality,
      addressRegion: s.region,
      postalCode: s.postalCode,
    },
    geo: { latitude: Number(s.latitude) || SITE.geo.latitude, longitude: Number(s.longitude) || SITE.geo.longitude },
    areaServed: s.areaServed.split(',').map((v) => v.trim()).filter(Boolean),
    socials,
    social: Object.values(socials).filter(Boolean),
    notifyEmails: s.notifyEmails,
    stats: { years: s.statYears, districts: s.statDistricts, fans: s.statFans },
  };
}
