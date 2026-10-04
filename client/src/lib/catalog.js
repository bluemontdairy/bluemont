import connectDB from './db';
import Product from '../models/Product';
import { brandSlug } from './brands';
import { str, ValidationError } from './validate';

const serialize = (p) => ({
  _id: String(p._id),
  name: p.name,
  brand: p.brand,
  category: p.category,
  format: p.format,
  volume: p.volume || '',
  mrp: typeof p.mrp === 'number' ? p.mrp : null,
  image: p.image || '',
  description: p.description || '',
  isActive: p.isActive !== false,
  sortOrder: p.sortOrder || 0,
});

/** Active products as plain objects, safe to pass to client components. */
export async function getActiveProducts() {
  await connectDB();
  const products = await Product.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return products.map(serialize);
}

export async function getAllProducts() {
  await connectDB();
  const products = await Product.find().sort({ brand: 1, sortOrder: 1, name: 1 }).lean();
  return products.map(serialize);
}

/** Whitelists and normalises product fields from the admin form. */
export function productInput(body) {
  const mrpRaw = body.mrp;
  let mrp = null;
  if (mrpRaw !== '' && mrpRaw !== null && mrpRaw !== undefined) {
    mrp = Number(mrpRaw);
    if (!Number.isFinite(mrp) || mrp < 0) throw new ValidationError('MRP must be a positive number.');
  }

  const image = str(body.image, { max: 500, label: 'Image' });
  if (image && !/^(\/|https:\/\/)/.test(image)) throw new ValidationError('Image must be an uploaded image or a site path.');

  const brand = brandSlug(str(body.brand, { max: 60, required: true, label: 'Brand' }));
  if (!brand) throw new ValidationError('Brand is required.');

  return {
    name: str(body.name, { max: 120, required: true, label: 'Name' }),
    brand,
    category: str(body.category, { max: 80, required: true, label: 'Product line' }),
    format: str(body.format, { max: 40, required: true, label: 'Format' }),
    volume: str(body.volume, { max: 40, label: 'Volume' }),
    mrp,
    image,
    description: str(body.description, { max: 1000, label: 'Description' }),
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}
