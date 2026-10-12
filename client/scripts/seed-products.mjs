// Loads the starting categories and catalog into MongoDB.
//
//   npm run seed                      add missing categories and products (no images)
//   npm run seed -- --reset           delete every product first, then load the list
//   npm run seed -- --images          also upload the packshots in public/brand/products
//                                     to Cloudinary and link them to products with no image
//   npm run seed -- --site-media      also upload the built-in site images (logos, mascots,
//                                     textures...) to Cloudinary for slots with no upload
//
// Existing products and categories are never overwritten without --reset,
// so prices or images edited in the admin panel survive a re-run. Images are
// normally uploaded by the owners from the admin panel; --images and
// --site-media are for filling a fresh site in one go.

import path from 'node:path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import SiteMedia from '../src/models/SiteMedia.js';
import { DEFAULT_CATEGORIES } from '../src/lib/categorySchema.js';
import { SITE_MEDIA_SLOTS } from '../src/lib/siteMediaSlots.js';
import { CATALOG } from './lib/catalog-data.mjs';
import { configureCloudinary } from './lib/cloudinary-env.mjs';
import { refreshSite } from './lib/refresh-site.mjs';

const args = new Set(process.argv.slice(2));
const reset = args.has('--reset');
const withImages = args.has('--images');
const withSiteMedia = args.has('--site-media');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env).');
  process.exit(1);
}

const publicFile = (p) => path.join(process.cwd(), 'public', p);

// One upload per file, even when many products share a packshot.
const uploaded = new Map();
async function upload(localPath, folder) {
  const cacheKey = `${folder}:${localPath}`;
  if (!uploaded.has(cacheKey)) {
    const res = await cloudinary.uploader.upload(publicFile(localPath), {
      folder: `${FOLDER}/${folder}`,
      resource_type: 'image',
      unique_filename: true,
    });
    uploaded.set(cacheKey, { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height });
    console.log(`  uploaded ${localPath}`);
  }
  return uploaded.get(cacheKey);
}

await mongoose.connect(process.env.MONGODB_URI);
let FOLDER = 'bluemont';
try {
  if (withImages || withSiteMedia) FOLDER = await configureCloudinary(cloudinary);

  // Categories
  await Category.syncIndexes();
  const catResult = await Category.bulkWrite(
    DEFAULT_CATEGORIES.map((c) => ({ updateOne: { filter: { slug: c.slug }, update: { $setOnInsert: c }, upsert: true } }))
  );
  console.log(`Categories: ${catResult.upsertedCount} added, ${DEFAULT_CATEGORIES.length - catResult.upsertedCount} already existed.`);
  const categoryId = Object.fromEntries((await Category.find().lean()).map((c) => [c.slug, c._id]));

  // Products (no images yet)
  if (reset) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`Deleted ${deletedCount} existing products.`);
  }
  await Product.syncIndexes();
  const docs = CATALOG.map(({ image, category, ...p }) => ({ ...p, category: categoryId[category], image: '' }));
  const result = await Product.bulkWrite(
    docs.map((p) => ({ updateOne: { filter: { brand: p.brand, name: p.name }, update: { $setOnInsert: p }, upsert: true } }))
  );
  console.log(`Products: ${CATALOG.length} in list, ${result.upsertedCount} added, ${CATALOG.length - result.upsertedCount} already existed.`);

  // Packshots -> Cloudinary, linked to products that have no image (or still
  // point at a built-in /brand/ file).
  if (withImages) {
    console.log('Uploading packshots…');
    let linked = 0;
    for (const item of CATALOG.filter((p) => p.image)) {
      const product = await Product.findOne({ brand: item.brand, name: item.name });
      if (!product || (product.image && !product.image.startsWith('/'))) continue;
      const img = await upload(item.image, 'products');
      Object.assign(product, { image: img.url, imagePublicId: img.publicId, imageWidth: img.width, imageHeight: img.height });
      await product.save();
      linked += 1;
    }
    console.log(`Linked images to ${linked} products (${uploaded.size} files uploaded).`);
  }

  // Built-in site images -> Cloudinary, for slots nobody has uploaded to.
  if (withSiteMedia) {
    console.log('Uploading site images…');
    let count = 0;
    for (const slot of SITE_MEDIA_SLOTS.filter((s) => s.fallback)) {
      if (await SiteMedia.exists({ key: slot.key })) continue;
      const img = await upload(slot.fallback, 'site');
      await SiteMedia.create({ key: slot.key, url: img.url, publicId: img.publicId, resourceType: 'image', width: img.width, height: img.height, updatedBy: 'seed' });
      count += 1;
    }
    console.log(`Filled ${count} site image slots.`);
  }
  await refreshSite();
} finally {
  await mongoose.disconnect();
}
