import 'server-only';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import connectDB from './db';
import Review from '../models/Review';
import { str, ValidationError } from './validate';
import { isCloudinaryUrl } from './media';

export const REVIEWS_TAG = 'reviews';

/** Call after any review change so the homepage updates. */
export function refreshReviews() {
  revalidateTag(REVIEWS_TAG, { expire: 0 });
  revalidatePath('/');
}

export const serializeReview = (r) => ({
  _id: String(r._id),
  quote: r.quote,
  name: r.name,
  place: r.place || '',
  rating: typeof r.rating === 'number' ? r.rating : null,
  photo: r.photo || '',
  photoPublicId: r.photoPublicId || '',
  consent: !!r.consent,
  isPublished: !!r.isPublished,
  sortOrder: r.sortOrder || 0,
  updatedBy: r.updatedBy || '',
  updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
});

const SORT = { sortOrder: 1, createdAt: -1 };

const cachedPublished = unstable_cache(
  async () => {
    await connectDB();
    return (await Review.find({ isPublished: true }).sort(SORT).lean()).map(serializeReview);
  },
  ['published-reviews-v1'],
  { tags: [REVIEWS_TAG], revalidate: 3600 }
);

/** Published reviews for the homepage. */
export async function getPublishedReviews() {
  try {
    return await cachedPublished();
  } catch (error) {
    console.error('Failed to load reviews', error?.message);
    return [];
  }
}

/** Every review, for the admin panel (never cached). */
export async function getAllReviews() {
  await connectDB();
  return (await Review.find().sort(SORT).lean()).map(serializeReview);
}

/** Whitelists review fields from the admin form. */
export function reviewInput(body) {
  const rating = body.rating === '' || body.rating == null ? null : Number(body.rating);
  if (rating !== null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
    throw new ValidationError('Rating must be 1 to 5 stars, or none.');
  }
  const photo = str(body.photo, { max: 500, label: 'Photo' });
  if (photo && !isCloudinaryUrl(photo)) throw new ValidationError('Upload the photo from the admin panel.');

  const consent = body.consent === true;
  const isPublished = body.isPublished === true;
  if (isPublished && !consent) {
    throw new ValidationError('Tick “The customer agreed to be quoted” before publishing.');
  }

  return {
    quote: str(body.quote, { max: 400, required: true, label: 'Review' }),
    name: str(body.name, { max: 60, required: true, label: 'Name' }),
    place: str(body.place, { max: 60, label: 'Town or shop' }),
    rating,
    photo,
    photoPublicId: photo ? str(body.photoPublicId, { max: 300, label: 'Photo id' }) : '',
    consent,
    isPublished,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}
