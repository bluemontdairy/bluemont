'use client';

// next/image loader. Cloudinary images are resized and converted (AVIF/WebP)
// by Cloudinary's CDN, so the Next.js server never touches them. Built-in
// fallbacks in /public (used until an admin uploads a replacement) are served
// as they are.

import { cldTransform, isCloudinaryUrl } from './media';

export default function imageLoader({ src, width, quality }) {
  if (isCloudinaryUrl(src)) return cldTransform(src, `f_auto,q_${quality || 'auto'},c_limit,w_${width}`);
  return src.includes('?') ? src : `${src}?w=${width}`;
}
