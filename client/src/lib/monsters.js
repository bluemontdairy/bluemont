import 'server-only';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import connectDB from './db';
import Monster from '../models/Monster';
import { MONSTERS } from './homeContent';
import { str, ValidationError } from './validate';
import { isCloudinaryUrl } from './media';

export const MONSTERS_TAG = 'monsters';

/** Call after any monster change so the homepage updates. */
export function refreshMonsters() {
  revalidateTag(MONSTERS_TAG, { expire: 0 });
  revalidatePath('/');
}

export const serializeMonster = (m) => ({
  _id: String(m._id),
  name: m.name,
  flavour: m.flavour || '',
  image: m.image,
  imagePublicId: m.imagePublicId || '',
  imageWidth: m.imageWidth || null,
  imageHeight: m.imageHeight || null,
  tint: m.tint || '#DCEBFA',
  scoopColor: m.scoopColor || '#FFF0C2',
  scoopImage: m.scoopImage || '',
  scoopImagePublicId: m.scoopImagePublicId || '',
  isActive: m.isActive !== false,
  sortOrder: m.sortOrder || 0,
  updatedBy: m.updatedBy || '',
});

const SORT = { sortOrder: 1, createdAt: 1 };

const cachedAll = unstable_cache(
  async () => {
    await connectDB();
    return (await Monster.find().sort(SORT).lean()).map(serializeMonster);
  },
  ['monsters-v1'],
  { tags: [MONSTERS_TAG], revalidate: 3600 }
);

/**
 * The built-in monsters (lib/homeContent.js), with pictures from their site
 * media slots. `media` is getSiteMedia().
 */
export const builtInMonsters = (media) =>
  MONSTERS.map((m, i) => ({
    name: m.name,
    flavour: m.flavour,
    image: media[m.image]?.src || '',
    imageWidth: media[m.image]?.w || null,
    imageHeight: media[m.image]?.h || null,
    tint: m.tint,
    scoopColor: m.scoop,
    scoopImage: '',
    isActive: true,
    sortOrder: i,
  })).filter((m) => m.image);

/**
 * Monsters for the homepage. Until any are added in Admin → Monsters the
 * built-in ones are shown; after that only the visible saved ones are.
 */
export async function getHomeMonsters(media) {
  try {
    const all = await cachedAll();
    if (all.length) return all.filter((m) => m.isActive);
  } catch (error) {
    console.error('Failed to load monsters', error?.message);
  }
  return builtInMonsters(media);
}

/** Every monster, for the admin panel (never cached). */
export async function getAllMonsters() {
  await connectDB();
  return (await Monster.find().sort(SORT).lean()).map(serializeMonster);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const colour = (value, label) => {
  const out = str(value, { max: 7, required: true, label });
  if (!HEX.test(out)) throw new ValidationError(`${label} must be a colour like #FFE7C2.`);
  return out.toUpperCase();
};

// Uploaded pictures are on Cloudinary; the imported built-ins point at their
// files in /public/brand.
const picture = (value, label, required) => {
  const url = str(value, { max: 500, required, label });
  if (url && !isCloudinaryUrl(url) && !/^\/brand\/[\w./-]+$/.test(url)) {
    throw new ValidationError(`Upload the ${label.toLowerCase()} from the admin panel.`);
  }
  return url;
};

const size = (value) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null);

/** Whitelists monster fields from the admin form. */
export function monsterInput(body) {
  const image = picture(body.image, 'Monster picture', true);
  const scoopImage = picture(body.scoopImage, 'Scoop picture', false);
  return {
    name: str(body.name, { max: 40, required: true, label: 'Name' }),
    flavour: str(body.flavour, { max: 60, label: 'Tagline' }),
    image,
    imagePublicId: isCloudinaryUrl(image) ? str(body.imagePublicId, { max: 300, label: 'Picture id' }) : '',
    imageWidth: size(body.imageWidth),
    imageHeight: size(body.imageHeight),
    tint: colour(body.tint, 'Card colour'),
    scoopColor: colour(body.scoopColor, 'Scoop colour'),
    scoopImage,
    scoopImagePublicId: isCloudinaryUrl(scoopImage) ? str(body.scoopImagePublicId, { max: 300, label: 'Scoop picture id' }) : '',
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}
