// Loads the official catalog from the scope document (section 4) into MongoDB.
//
//   npm run seed            add missing products; leaves existing ones alone
//   npm run seed -- --reset delete every product first, then load the list
//
// Existing products are never overwritten without --reset, so prices or
// images edited in the admin panel survive a re-run.

import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const P = '/brand/products';

// [name, mrp, image?] grouped by product line.
const lines = [
  {
    brand: 'baeleys', category: 'Monstro Cone', format: 'Cones', volume: '',
    items: [
      ['Butterscotch Monstro Cone', 100, `${P}/cone-butterscotch.webp`],
      ['Chocolate Monstro Cone', 100, `${P}/cone-chocolate.webp`],
      ['21 Love Monstro Cone', 100, `${P}/cone-21-love.webp`],
    ],
  },
  {
    brand: 'baeleys', category: 'Mini Cup', format: 'Cups', volume: '40 ml',
    items: [['Frozen Dessert (Vanilla) Mini Cup', 20]],
  },
  {
    brand: 'baeleys', category: 'Big Cup', format: 'Cups', volume: '100 ml',
    items: [
      ['Vanilla Big Cup', 60],
      ['Strawberry Big Cup', 60],
      ['21 Love Big Cup', 65],
      ['Chocolate Big Cup', 65],
      ['Butterscotch Big Cup', 65],
      ['Blueberry Big Cup', 70],
      ['Pistachio Big Cup', 70],
    ].map(([n, m]) => [n, m, `${P}/cup-100ml.webp`]),
  },
  {
    brand: 'baeleys', category: 'Super Sundae', format: 'Sundaes', volume: '',
    items: [
      ['21 Love Super Sundae', 90],
      ['Strawberry Super Sundae', 90, `${P}/sundae-strawberry.webp`],
      ['Mango Super Sundae', 90, `${P}/sundae-mango.webp`],
      ['Rainbow Super Sundae', 90],
      ['Butterscotch Super Sundae', 90],
      ['Chocolate Super Sundae', 100, `${P}/sundae-chocolate.webp`],
    ],
  },
  {
    brand: 'baeleys', category: 'Bar', format: 'Bars', volume: '',
    items: [
      ['Chocobar', 50, `${P}/chocobar.webp`],
      ['Mango Bar', 50],
      ['Nutty Crunch', 75, `${P}/nutty-crunch.webp`],
      ['Oreo Bar', 80, `${P}/oreo-bar.webp`],
    ],
  },
  {
    brand: 'baeleys', category: 'Mini Bar', format: 'Bars', volume: '',
    items: [
      ['Milky Bar', 20, `${P}/milky-bar.webp`],
      ['Mini Chocobar', 30, `${P}/mini-chocobar.webp`],
    ],
  },
  {
    brand: 'baeleys', category: 'Mini Pack (Tub)', format: 'Packs', volume: '500 ml',
    items: [
      ['Vanilla Mini Pack', 200],
      ['Strawberry Mini Pack', 200],
      ['21 Love Mini Pack', 240],
      ['Chocolate Mini Pack', 240],
      ['Butterscotch Mini Pack', 250],
      ['Blueberry Mini Pack', 260],
      ['Pistachio Mini Pack', 265],
    ].map(([n, m]) => [n, m, `${P}/mini-pack-500ml.webp`]),
  },
  {
    brand: 'baeleys', category: 'Family Pack (Tub)', format: 'Packs', volume: '1000 ml',
    items: [
      ['Vanilla Family Pack', 390],
      ['Strawberry Family Pack', 390],
      ['21 Love Family Pack', 440],
      ['Chocolate Family Pack', 440],
      ['Butterscotch Family Pack', 460],
      ['Blueberry Family Pack', 465],
      ['Pistachio Family Pack', 470],
    ].map(([n, m]) => [n, m, `${P}/family-pack-1000ml.webp`]),
  },
  {
    brand: 'baeleys', category: 'Tub Box (Food Service)', format: 'Bulk', volume: 'Tub Box',
    items: [
      ['Vanilla Tub Box', 1250],
      ['Strawberry Tub Box', 1250],
      ['21 Love Tub Box', 1365],
      ['Chocolate Tub Box', 1365],
      ['Butterscotch Tub Box', 1365],
      ['Blueberry Tub Box', 1500],
      ['Pistachio Tub Box', 1750],
    ].map(([n, m]) => [n, m, `${P}/tub-box.webp`]),
  },
  {
    brand: 'blissberry', category: 'Kulfusion Stick', format: 'Sticks', volume: '',
    items: [
      ['Mango Kulfusion', 60, `${P}/blissberry-mango.webp`],
      ['Honeydew Kulfusion', 60, `${P}/blissberry-honeydew.webp`],
      ['Blueberry Kulfusion', 60, `${P}/blissberry-blueberry.webp`],
      ['Taro Kulfusion', 60, `${P}/blissberry-taro.webp`],
    ],
  },
  {
    // Scope doc gives no unit prices for Top Kulfi yet: they show
    // "MRP on request" until prices are entered in the admin panel.
    brand: 'topkulfi', category: 'Heritage Line', format: 'Popsicles', volume: '',
    items: [
      ['Traditional Khuwa Kulfi', null],
      ['Titaura Popsicle', null],
      ['Seasonal Fresh Fruit Popsicle', null],
    ],
  },
];

const products = lines.flatMap(({ items, ...line }, lineIndex) =>
  items.map(([name, mrp, image = ''], i) => ({
    ...line,
    name,
    mrp,
    image,
    isActive: true,
    sortOrder: lineIndex * 100 + i,
  }))
);

const reset = process.argv.includes('--reset');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed-products.mjs');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  if (reset) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`Deleted ${deletedCount} existing products.`);
  }
  await Product.syncIndexes();

  const result = await Product.bulkWrite(
    products.map((p) => ({
      updateOne: { filter: { brand: p.brand, name: p.name }, update: { $setOnInsert: p }, upsert: true },
    }))
  );
  console.log(`Catalog: ${products.length} products in list, ${result.upsertedCount} added, ${products.length - result.upsertedCount} already existed.`);
} finally {
  await mongoose.disconnect();
}
