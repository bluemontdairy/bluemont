// The starting catalog from the scope document (section 4) plus the Top Kulfi
// range from the posters. Shared by seed-products.mjs and migrate-catalog.mjs.
//
// `image` is the packshot's file in public/ (only uploaded to Cloudinary when
// the seed runs with --images). `featured` puts it in the homepage's
// "Our latest favourites" carousel.

const P = '/brand/products';

// [name, mrp, image?, extra?] grouped by product line.
const lines = [
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Monstro Cone', format: 'Cones', volume: '',
    items: [
      ['Butterscotch Monstro Cone', 100, `${P}/cone-butterscotch.webp`, { flavour: 'Butterscotch' }],
      ['Chocolate Monstro Cone', 100, `${P}/cone-chocolate.webp`, { flavour: 'Chocolate' }],
      ['21 Love Monstro Cone', 100, `${P}/cone-21-love.webp`, { flavour: '21 Love', featured: true }],
    ],
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Mini Cup', format: 'Cups', volume: '40 ml',
    items: [['Frozen Dessert (Vanilla) Mini Cup', 20, '', { flavour: 'Vanilla', productType: 'Frozen dessert' }]],
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Big Cup', format: 'Cups', volume: '100 ml',
    items: [
      ['Vanilla Big Cup', 60],
      ['Strawberry Big Cup', 60],
      ['21 Love Big Cup', 65],
      ['Chocolate Big Cup', 65],
      ['Butterscotch Big Cup', 65],
      ['Blueberry Big Cup', 70],
      ['Pistachio Big Cup', 70],
    ].map(([n, m]) => [n, m, `${P}/cup-100ml.webp`, { flavour: n.replace(' Big Cup', '') }]),
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Super Sundae', format: 'Sundaes', volume: '',
    items: [
      ['21 Love Super Sundae', 90, '', { flavour: '21 Love' }],
      ['Strawberry Super Sundae', 90, `${P}/sundae-strawberry.webp`, { flavour: 'Strawberry', featured: true }],
      ['Mango Super Sundae', 90, `${P}/sundae-mango.webp`, { flavour: 'Mango' }],
      ['Rainbow Super Sundae', 90, '', { flavour: 'Rainbow' }],
      ['Butterscotch Super Sundae', 90, '', { flavour: 'Butterscotch' }],
      ['Chocolate Super Sundae', 100, `${P}/sundae-chocolate.webp`, { flavour: 'Chocolate', featured: true }],
    ],
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Bar', format: 'Bars', volume: '',
    items: [
      ['Chocobar', 50, `${P}/chocobar.webp`, { flavour: 'Chocolate' }],
      ['Mango Bar', 50, '', { flavour: 'Mango' }],
      ['Nutty Crunch', 75, `${P}/nutty-crunch.webp`, { featured: true }],
      ['Oreo Bar', 80, `${P}/oreo-bar.webp`, { flavour: 'Oreo', featured: true }],
    ],
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Mini Bar', format: 'Bars', volume: '',
    items: [
      ['Milky Bar', 20, `${P}/milky-bar.webp`, { flavour: 'Milk' }],
      ['Mini Chocobar', 30, `${P}/mini-chocobar.webp`, { flavour: 'Chocolate' }],
    ],
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Mini Pack (Tub)', format: 'Packs', volume: '500 ml',
    items: [
      ['Vanilla Mini Pack', 200],
      ['Strawberry Mini Pack', 200],
      ['21 Love Mini Pack', 240],
      ['Chocolate Mini Pack', 240],
      ['Butterscotch Mini Pack', 250],
      ['Blueberry Mini Pack', 260],
      ['Pistachio Mini Pack', 265],
    ].map(([n, m]) => [n, m, `${P}/mini-pack-500ml.webp`, { flavour: n.replace(' Mini Pack', '') }]),
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Family Pack (Tub)', format: 'Packs', volume: '1000 ml',
    items: [
      ['Vanilla Family Pack', 390, `${P}/family-pack-1000ml.webp`, { flavour: 'Vanilla', featured: true }],
      ['Strawberry Family Pack', 390],
      ['21 Love Family Pack', 440],
      ['Chocolate Family Pack', 440],
      ['Butterscotch Family Pack', 460],
      ['Blueberry Family Pack', 465],
      ['Pistachio Family Pack', 470],
    ].map(([n, m, img, extra]) => [n, m, img || `${P}/family-pack-1000ml.webp`, { flavour: n.replace(' Family Pack', ''), ...extra }]),
  },
  {
    brand: 'baeleys', category: 'ice-cream', line: 'Tub Box (Food Service)', format: 'Bulk', volume: 'Tub Box',
    items: [
      ['Vanilla Tub Box', 1250],
      ['Strawberry Tub Box', 1250],
      ['21 Love Tub Box', 1365],
      ['Chocolate Tub Box', 1365],
      ['Butterscotch Tub Box', 1365],
      ['Blueberry Tub Box', 1500],
      ['Pistachio Tub Box', 1750],
    ].map(([n, m]) => [n, m, `${P}/tub-box.webp`, { flavour: n.replace(' Tub Box', '') }]),
  },
  {
    brand: 'blissberry', category: 'kulfusion', line: 'Kulfusion Stick', format: 'Sticks', volume: '',
    items: [
      ['Mango Kulfusion', 60, `${P}/blissberry-mango.webp`, { flavour: 'Mango', featured: true }],
      ['Honeydew Kulfusion', 60, `${P}/blissberry-honeydew.webp`, { flavour: 'Honeydew' }],
      ['Blueberry Kulfusion', 60, `${P}/blissberry-blueberry.webp`, { flavour: 'Blueberry' }],
      ['Taro Kulfusion', 60, `${P}/blissberry-taro.webp`, { flavour: 'Taro', featured: true }],
    ],
  },
  {
    // No unit prices for Top Kulfi yet (the only sheet is dealer pricing):
    // they show "MRP on request" until prices are entered in the admin panel.
    brand: 'topkulfi', category: 'kulfi', line: 'Heritage Line', format: 'Kulfi', volume: '',
    items: [
      ['Titaura Popsicle', null, `${P}/kulfi-titaura.webp`, { flavour: 'Titaura', base: 'Fruit', featured: true, format: 'Popsicles' }],
      ['Vanilla Kulfi', null, `${P}/kulfi-vanilla.webp`, { flavour: 'Vanilla', base: 'Khuwa (milk)' }],
      ['Chocodip Kulfi', null, `${P}/kulfi-chocodip.webp`, { flavour: 'Chocolate', base: 'Chocolate coated', featured: true }],
      ['Chocom Kulfi', null, `${P}/kulfi-chocom.webp`, { flavour: 'Chocolate', base: 'Chocolate coated', featured: true }],
      ['Blueberry Kulfi', null, `${P}/kulfi-blueberry.webp`, { flavour: 'Blueberry', base: 'Khuwa (milk)', featured: true }],
      ['Mini Vanilla Kulfi', null, `${P}/kulfi-mini-vanilla.webp`, { flavour: 'Vanilla', base: 'Khuwa (milk)' }],
      ['Seasonal Fresh Fruit Popsicle', null, `${P}/kulfi-fruit-popsicle.webp`, { flavour: 'Seasonal fruit', base: 'Fruit', format: 'Popsicles' }],
      ['Traditional Khuwa Kulfi', null, '', { flavour: 'Khuwa', base: 'Khuwa (milk)' }],
    ],
  },
];

const ATTRIBUTE_KEYS = ['flavour', 'productType', 'base'];

export const CATALOG = lines.flatMap(({ items, ...line }, lineIndex) =>
  items.map(([name, mrp, image = '', extra = {}], i) => {
    const attributes = {};
    for (const key of ATTRIBUTE_KEYS) if (extra[key]) attributes[key] = extra[key];
    if (line.category === 'ice-cream' && !attributes.productType) attributes.productType = 'Ice cream';
    return {
      ...line,
      format: extra.format || line.format,
      name,
      mrp,
      image,
      attributes,
      featured: extra.featured === true,
      isActive: true,
      sortOrder: lineIndex * 100 + i,
    };
  })
);
