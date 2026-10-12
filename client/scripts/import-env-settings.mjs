// One-off: copies business settings that used to live in .env (site URL,
// contact email, WhatsApp...) into the database (Admin → Site
// settings). Values already set in the admin are kept, and stored keys that
// are no longer settings are removed. Secrets are encrypted with
// AUTH_SECRET. Prints key names only, never values.
//
//   npm run settings:import-env
//
// Server credentials (MONGODB_URI, AUTH_SECRET, SMTP_*, CLOUDINARY_*) stay
// in .env.

import mongoose from 'mongoose';
import SiteSettings from '../src/models/SiteSettings.js';
import { checkSetting, SETTINGS_FIELDS, SETTINGS_KEYS } from '../src/lib/settingsSchema.js';
import { seal } from '../src/lib/sealing.js';
import { refreshSite } from './lib/refresh-site.mjs';

const FROM_ENV = {
  siteUrl: 'NEXT_PUBLIC_SITE_URL',
  whatsappNumber: 'NEXT_PUBLIC_WHATSAPP_NUMBER',
  phone: 'NEXT_PUBLIC_SALES_PHONE',
  email: 'NEXT_PUBLIC_CONTACT_EMAIL',
  notifyEmails: 'MANAGEMENT_EMAIL',
};

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const doc = await SiteSettings.findById('site').lean();
  const values = { ...(doc?.values || {}) };
  const removed = Object.keys(values).filter((k) => !SETTINGS_KEYS.has(k));
  for (const k of removed) delete values[k];
  const imported = [];
  const skipped = [];

  for (const field of SETTINGS_FIELDS) {
    const name = FROM_ENV[field.key];
    const raw = name && process.env[name];
    if (!raw || raw === '...' || values[field.key]) continue;
    if (field.secret) {
      values[field.key] = seal(raw.trim());
      imported.push(field.key);
      continue;
    }
    const { value, error } = checkSetting(field, raw);
    if (error || !value) skipped.push(`${field.key} (${error || 'empty'})`);
    else {
      values[field.key] = value;
      imported.push(field.key);
    }
  }

  await SiteSettings.findByIdAndUpdate('site', { values, updatedBy: 'import from .env' }, { upsert: true });
  console.log(`Imported: ${imported.join(', ') || 'nothing new'}`);
  if (removed.length) console.log(`Removed (no longer settings): ${removed.join(', ')}`);
  if (skipped.length) console.log(`Skipped (invalid): ${skipped.join('; ')}`);
  await refreshSite();
} finally {
  await mongoose.disconnect();
}
