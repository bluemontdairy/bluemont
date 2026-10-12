import { unstable_cache } from 'next/cache';
import mongoose from 'mongoose';
import connectDB from './db';
import Product from '../models/Product';
import Category from '../models/Category';
import { brandSlug } from './brands';
import { str, ValidationError } from './validate';
import { isCloudinaryUrl } from './media';
import { validateAttributeDefs, validateAttributeValues, slugify } from './categorySchema';

export const CATALOG_TAG = 'catalog';

const serializeCategory = (c) => ({
  _id: String(c._id),
  name: c.name,
  slug: c.slug,
  description: c.description || '',
  image: c.image || '',
  imagePublicId: c.imagePublicId || '',
  attributes: (c.attributes || []).map((a) => ({
    key: a.key,
    label: a.label,
    type: a.type,
    options: a.options || [],
    unit: a.unit || '',
    required: !!a.required,
    showOnCard: !!a.showOnCard,
  })),
  seoTitle: c.seoTitle || '',
  seoDescription: c.seoDescription || '',
  isActive: c.isActive !== false,
  sortOrder: c.sortOrder || 0,
});

const serializeProduct = (p, categoriesById) => {
  const category = categoriesById.get(String(p.category));
  return {
    _id: String(p._id),
    name: p.name,
    brand: p.brand,
    category: category ? { _id: category._id, name: category.name, slug: category.slug } : null,
    categoryId: p.category ? String(p.category) : '',
    line: p.line || '',
    format: p.format,
    volume: p.volume || '',
    mrp: typeof p.mrp === 'number' ? p.mrp : null,
    image: p.image || '',
    imagePublicId: p.imagePublicId || '',
    imageWidth: p.imageWidth || null,
    imageHeight: p.imageHeight || null,
    description: p.description || '',
    attributes: p.attributes && typeof p.attributes === 'object' ? p.attributes : {},
    featured: !!p.featured,
    isActive: p.isActive !== false,
    sortOrder: p.sortOrder || 0,
  };
};

async function loadCatalog({ includeHidden }) {
  await connectDB();
  const [categories, products] = await Promise.all([
    Category.find(includeHidden ? {} : { isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    Product.find(includeHidden ? {} : { isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);
  const cats = categories.map(serializeCategory);
  const byId = new Map(cats.map((c) => [c._id, c]));
  // Products in a hidden category are hidden from the public site too.
  const list = products
    .filter((p) => includeHidden || byId.has(String(p.category)))
    .map((p) => serializeProduct(p, byId));
  return { categories: cats, products: list };
}

// Public pages read through the cache; admin changes call revalidateTag.
const cachedPublicCatalog = unstable_cache(() => loadCatalog({ includeHidden: false }), ['public-catalog-v2'], {
  tags: [CATALOG_TAG],
  revalidate: 3600,
});

/** Active categories and products, as plain objects safe for client components. */
export async function getPublicCatalog() {
  try {
    return await cachedPublicCatalog();
  } catch (error) {
    console.error('Failed to load catalog', error?.message);
    return { categories: [], products: [] };
  }
}

export async function getActiveProducts() {
  return (await getPublicCatalog()).products;
}

/** Everything, including hidden items, for the admin panel (never cached). */
export const getAdminCatalog = () => loadCatalog({ includeHidden: true });

/** Whitelists and normalises product fields from the admin form. */
export async function productInput(body) {
  const mrpRaw = body.mrp;
  let mrp = null;
  if (mrpRaw !== '' && mrpRaw !== null && mrpRaw !== undefined) {
    mrp = Number(mrpRaw);
    if (!Number.isFinite(mrp) || mrp < 0) throw new ValidationError('MRP must be a positive number.');
  }

  const brand = brandSlug(str(body.brand, { max: 60, required: true, label: 'Brand' }));
  if (!brand) throw new ValidationError('Brand is required.');

  if (!mongoose.isValidObjectId(body.categoryId)) throw new ValidationError('Choose a category.');
  await connectDB();
  const category = await Category.findById(body.categoryId).lean();
  if (!category) throw new ValidationError('That category no longer exists.');

  return {
    name: str(body.name, { max: 120, required: true, label: 'Name' }),
    brand,
    category: category._id,
    line: str(body.line, { max: 80, required: true, label: 'Product line' }),
    format: str(body.format, { max: 40, required: true, label: 'Format' }),
    volume: str(body.volume, { max: 40, label: 'Volume' }),
    mrp,
    ...imageInput(body),
    description: str(body.description, { max: 1000, label: 'Description' }),
    attributes: validateAttributeValues(category.attributes, body.attributes),
    featured: body.featured === true,
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}

// Built-in packshots from before the Cloudinary move (/brand/products/...).
// Kept so an old product can still be saved; replace them by uploading.
const LEGACY_IMAGE = /^\/brand\/[a-z0-9/_-]+\.(webp|png|jpe?g)$/;

/** Image fields from an /api/upload result; only this site's Cloudinary URLs are accepted. */
export function imageInput(body) {
  const image = str(body.image, { max: 500, label: 'Image' });
  if (!image) return { image: '', imagePublicId: '', imageWidth: null, imageHeight: null };
  if (!isCloudinaryUrl(image) && !LEGACY_IMAGE.test(image)) throw new ValidationError('Upload the image from the admin panel.');
  const dim = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : null);
  return {
    image,
    imagePublicId: str(body.imagePublicId, { max: 300, label: 'Image id' }),
    imageWidth: dim(body.imageWidth),
    imageHeight: dim(body.imageHeight),
  };
}

/** Whitelists category fields from the admin form. */
export function categoryInput(body) {
  const name = str(body.name, { max: 60, required: true, label: 'Name' });
  const slug = slugify(str(body.slug, { max: 60, label: 'URL name' }) || name);
  if (!slug) throw new ValidationError('URL name is required.');
  if (['all', 'new', 'admin'].includes(slug)) throw new ValidationError(`"${slug}" is reserved. Choose another URL name.`);
  const { image, imagePublicId } = imageInput(body);

  return {
    name,
    slug,
    description: str(body.description, { max: 1000, label: 'Description' }),
    image,
    imagePublicId,
    attributes: validateAttributeDefs(body.attributes),
    seoTitle: str(body.seoTitle, { max: 70, label: 'SEO title' }),
    seoDescription: str(body.seoDescription, { max: 170, label: 'SEO description' }),
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}
