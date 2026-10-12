import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '../../../lib/catalog';
import { SITE_MEDIA_TAG } from '../../../lib/siteMedia';
import { SETTINGS_TAG } from '../../../lib/siteSettings';
import { REVIEWS_TAG } from '../../../lib/reviews';
import { safeEqual } from '../../../lib/secretBox';

// Lets the seed and site-media scripts, which write to MongoDB directly,
// refresh the website's cached catalog and images. Needs AUTH_SECRET in the
// x-revalidate-secret header.
export async function POST(request) {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || '';
  const given = request.headers.get('x-revalidate-secret') || '';
  if (secret.length < 32 || !safeEqual(given, secret)) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidateTag(SITE_MEDIA_TAG, { expire: 0 });
  revalidateTag(SETTINGS_TAG, { expire: 0 });
  revalidateTag(REVIEWS_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
