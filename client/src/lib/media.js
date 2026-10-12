// Client-safe helpers for images and videos hosted on Cloudinary. Uploads go
// through /api/upload (see lib/cloudinary.js); everything stored in the
// database is a full https://res.cloudinary.com/<cloud>/... URL. The cloud
// name is a setting (Admin → Site settings), so any cloud is recognised here.

const UPLOAD_SEGMENT = /\/(image|video)\/upload\//;
const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/(image|video)\/upload\//i;

/** True for Cloudinary delivery URLs. */
export const isCloudinaryUrl = (url) => typeof url === 'string' && CLOUDINARY_URL.test(url);

/**
 * Adds a transformation to a Cloudinary URL, e.g.
 * cldTransform(url, 'f_auto,q_auto,w_600'). Other URLs pass through unchanged.
 */
export const cldTransform = (url, transform) =>
  isCloudinaryUrl(url) ? url.replace(UPLOAD_SEGMENT, (m) => `${m}${transform}/`) : url;

/** Poster frame for an uploaded video (first frame, as an optimised image). */
export const videoPoster = (url) =>
  isCloudinaryUrl(url) ? cldTransform(url, 'so_0,f_auto,q_auto').replace(/\.[a-z0-9]+$/i, '.jpg') : '';

/** Absolute URL for SEO tags and JSON-LD; local paths get the site origin. */
export const absoluteMediaUrl = (url, siteUrl) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`);
