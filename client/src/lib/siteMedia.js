import 'server-only';
import { unstable_cache } from 'next/cache';
import connectDB from './db';
import SiteMedia from '../models/SiteMedia';
import { SITE_MEDIA_SLOTS } from './siteMediaSlots';

export const SITE_MEDIA_TAG = 'site-media';

const loadUploads = unstable_cache(
  async () => {
    await connectDB();
    const docs = await SiteMedia.find().lean();
    return docs.map((d) => ({
      key: d.key,
      url: d.url,
      resourceType: d.resourceType,
      width: d.width || null,
      height: d.height || null,
    }));
  },
  ['site-media-v1'],
  { tags: [SITE_MEDIA_TAG], revalidate: 3600 }
);

/**
 * Resolved site images: { key: { src, w, h, kind, uploaded } }. Slots with no
 * upload and no built-in file are left out, so callers can skip them.
 * Plain data, safe to pass to client components.
 */
export async function getSiteMedia() {
  let uploads = [];
  try {
    uploads = await loadUploads();
  } catch (error) {
    // The site still renders with built-in images if the database is down.
    console.error('Failed to load site media', error?.message);
  }
  const byKey = new Map(uploads.map((u) => [u.key, u]));

  const resolved = {};
  for (const slot of SITE_MEDIA_SLOTS) {
    const up = byKey.get(slot.key);
    if (up) {
      resolved[slot.key] = { src: up.url, w: up.width || slot.w || 800, h: up.height || slot.h || 800, kind: up.resourceType, uploaded: true };
    } else if (slot.fallback) {
      resolved[slot.key] = { src: slot.fallback, w: slot.w, h: slot.h, kind: slot.kind || 'image', uploaded: false };
    }
  }
  return resolved;
}
