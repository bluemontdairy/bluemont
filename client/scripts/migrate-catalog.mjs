// One-off upgrade of an existing database to the category-wise schema and
// Cloudinary images. Safe to run more than once.
//
//   npm run migrate
//
// 1. Creates the default categories (Ice Cream, Kulfi, Kulfusion) if missing.
// 2. Moves each product's old free-text `category` (e.g. "Big Cup") to
//    `line`, and links the product to a real category by brand.
// 3. Copies images uploaded through the old admin panel (stored in MongoDB,
//    served from /media/<id>) to Cloudinary and updates the products.
// 4. If no product is featured yet, marks the homepage favourites.
//
// Products that still point at a built-in /brand/... file keep it; run
// `npm run seed -- --images` (or upload from the admin panel) to move them.

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Category from '../src/models/Category.js';
import { DEFAULT_CATEGORIES, DEFAULT_CATEGORY_FOR_BRAND } from '../src/lib/categorySchema.js';
import { CATALOG } from './lib/catalog-data.mjs';
import { configureCloudinary } from './lib/cloudinary-env.mjs';
import { refreshSite } from './lib/refresh-site.mjs';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const db = mongoose.connection.db;
  const products = db.collection('products');

  // 1. Categories
  await Category.syncIndexes();
  const cat = await Category.bulkWrite(
    DEFAULT_CATEGORIES.map((c) => ({ updateOne: { filter: { slug: c.slug }, update: { $setOnInsert: c }, upsert: true } }))
  );
  console.log(`Categories: ${cat.upsertedCount} created.`);
  const categoryId = Object.fromEntries((await Category.find().lean()).map((c) => [c.slug, c._id]));

  // 2. category string -> line, category -> ObjectId
  let moved = 0;
  for (const p of await products.find({ category: { $type: 'string' } }).toArray()) {
    const slug = DEFAULT_CATEGORY_FOR_BRAND[p.brand] || 'ice-cream';
    await products.updateOne(
      { _id: p._id },
      { $set: { line: p.line || p.category, category: categoryId[slug], attributes: p.attributes || {}, featured: !!p.featured } }
    );
    moved += 1;
  }
  console.log(`Products linked to categories: ${moved}.`);

  // 3. /media/<id> images -> Cloudinary
  const legacy = await products.find({ image: /^\/media\// }).toArray();
  if (legacy.length) {
    const folder = await configureCloudinary(cloudinary);
    const media = db.collection('media');
    const done = new Map();
    for (const p of legacy) {
      const id = p.image.split('/').pop();
      if (!done.has(id)) {
        const doc = mongoose.isValidObjectId(id) ? await media.findOne({ _id: new mongoose.Types.ObjectId(id) }) : null;
        if (!doc) {
          console.warn(`  ${p.name}: image ${p.image} not found, cleared.`);
          done.set(id, null);
        } else {
          const buffer = Buffer.from(doc.data.buffer ?? doc.data);
          const res = await new Promise((resolve, reject) =>
            cloudinary.uploader
              .upload_stream({ folder: `${folder}/products`, resource_type: 'image' }, (e, r) => (e ? reject(e) : resolve(r)))
              .end(buffer)
          );
          done.set(id, { image: res.secure_url, imagePublicId: res.public_id, imageWidth: res.width, imageHeight: res.height });
          console.log(`  moved ${p.image} to Cloudinary`);
        }
      }
      const img = done.get(id) || { image: '', imagePublicId: '', imageWidth: null, imageHeight: null };
      await products.updateOne({ _id: p._id }, { $set: img });
    }
    console.log(`Images moved to Cloudinary: ${[...done.values()].filter(Boolean).length}. The "media" collection can be dropped once you've checked the site.`);
  }

  // 4. Homepage favourites
  if (!(await products.countDocuments({ featured: true }))) {
    const featured = CATALOG.filter((p) => p.featured);
    let marked = 0;
    for (const f of featured) marked += (await products.updateOne({ brand: f.brand, name: f.name }, { $set: { featured: true } })).modifiedCount;
    console.log(`Featured on the homepage: ${marked} products.`);
  }
  await refreshSite();
} finally {
  await mongoose.disconnect();
}
