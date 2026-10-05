// Home page content. Prices are MRP (NPR) from the Blue Mont scope document;
// packshots and mascots are cut from the Figma file (public/brand). Top Kulfi
// packshots are cut from the poster PDFs in public/assets/top-kulfi.

// Every product family Blue Mont makes. The home page renders one card per
// entry, so a new category (yoghurt, cheese...) is a new object here.
export const BRANDS = [
  {
    slug: 'topkulfi',
    name: 'Top Kulfi',
    category: 'Kulfi',
    logo: { src: '/brand/logo/top-kulfi-wordmark.webp', w: 960, h: 690 },
    text: 'The Rs 10 and Rs 20 kulfi Nepal grew up on. Titaura, Chocodip, Chocom and fruit popsicles, made the way we always have.',
    image: { src: '/brand/products/kulfi-chocodip.webp', w: 293, h: 900, alt: 'Top Kulfi Chocodip kulfi' },
    tint: '#FFE3D6',
  },
  {
    slug: 'baeleys',
    name: "Baeley's",
    category: 'Ice cream',
    logo: { src: '/brand/logo/wordmark.webp', w: 960, h: 440 },
    text: 'Cones, sundaes, bars and family tubs, with a monster on every pack. Premium ice cream at a price that makes sense.',
    image: { src: '/brand/products/cone-21-love.webp', w: 345, h: 863, alt: "Baeley's 21 Love Monstro Cone ice cream" },
    tint: '#DCEBFA',
  },
  {
    slug: 'blissberry',
    name: 'Blissberry',
    category: 'Kulfusion',
    text: 'Traditional kulfi blended with modern flavours: mango, honeydew, blueberry and taro.',
    image: { src: '/brand/products/blissberry-mango.webp', w: 347, h: 900, alt: 'Blissberry Kulfusion mango stick' },
    tint: '#E6DDF4',
  },
];

// `type` is what the product is (the client wants ice cream / kulfi / Kulfusion
// spelled out on every card); `brand` is who makes it.
export const FAVORITES = [
  { name: 'Chocom', brand: 'Top Kulfi', type: 'Kulfi', image: '/brand/products/kulfi-chocom.webp', w: 325, h: 900 },
  { name: 'Taro', brand: 'Blissberry', type: 'Kulfusion', price: 'Rs 60', image: '/brand/products/blissberry-taro.webp', w: 348, h: 900 },
  { name: 'Super Sundae Strawberry', brand: "Baeley's", type: 'Ice cream', price: 'Rs 90', image: '/brand/products/sundae-strawberry.webp', w: 486, h: 900 },
  { name: '21 Love Monstro Cone', brand: "Baeley's", type: 'Ice cream', price: 'Rs 100', image: '/brand/products/cone-21-love.webp', w: 345, h: 863 },
  { name: 'Chocodip', brand: 'Top Kulfi', type: 'Kulfi', image: '/brand/products/kulfi-chocodip.webp', w: 293, h: 900 },
  { name: 'Oreo Bar', brand: "Baeley's", type: 'Ice cream', price: 'Rs 80', image: '/brand/products/oreo-bar.webp', w: 407, h: 900 },
  { name: 'Mango', brand: 'Blissberry', type: 'Kulfusion', price: 'Rs 60', image: '/brand/products/blissberry-mango.webp', w: 347, h: 900 },
  { name: 'Nutty Crunch', brand: "Baeley's", type: 'Ice cream', price: 'Rs 75', image: '/brand/products/nutty-crunch.webp', w: 424, h: 900 },
  { name: 'Titaura', brand: 'Top Kulfi', type: 'Kulfi', image: '/brand/products/kulfi-titaura.webp', w: 285, h: 820 },
  { name: 'Family Pack 1000 ml', brand: "Baeley's", type: 'Ice cream', price: 'from Rs 390', image: '/brand/products/family-pack-1000ml.webp', w: 729, h: 833 },
  { name: 'Super Sundae Chocolate', brand: "Baeley's", type: 'Ice cream', price: 'Rs 100', image: '/brand/products/sundae-chocolate.webp', w: 478, h: 900 },
  { name: 'Blueberry', brand: 'Top Kulfi', type: 'Kulfi', image: '/brand/products/kulfi-blueberry.webp', w: 362, h: 823 },
];

// Top Kulfi lineup, cut from the poster PDF. No prices: the only price sheet
// we have is marked as dealer pricing.
export const TOP_KULFI = [
  { name: 'Titaura', image: '/brand/products/kulfi-titaura.webp', w: 285, h: 820 },
  { name: 'Vanilla', image: '/brand/products/kulfi-vanilla.webp', w: 292, h: 900 },
  { name: 'Chocodip', image: '/brand/products/kulfi-chocodip.webp', w: 293, h: 900 },
  { name: 'Chocom', image: '/brand/products/kulfi-chocom.webp', w: 325, h: 900 },
  { name: 'Blueberry', image: '/brand/products/kulfi-blueberry.webp', w: 362, h: 823 },
  { name: 'Mini Vanilla', image: '/brand/products/kulfi-mini-vanilla.webp', w: 221, h: 550 },
  { name: 'Fruit Popsicle', image: '/brand/products/kulfi-fruit-popsicle.webp', w: 536, h: 591 },
];

// `scoop` tints the ice-cream scoop drawn beside each monster.
export const MONSTERS = [
  { name: 'The Main Monster', flavour: 'Chief taster', image: '/brand/mascots/yeti-main.webp', w: 630, h: 743, tint: '#DCEBFA', scoop: '#FFF3D6' },
  { name: 'Vanilla', flavour: 'Soft and creamy', image: '/brand/mascots/vanilla.webp', w: 657, h: 686, tint: '#FFF4CC', scoop: '#FFF0C2' },
  { name: 'Strawberry', flavour: 'Berry wild', image: '/brand/mascots/strawberry.webp', w: 790, h: 799, tint: '#FCE1EA', scoop: '#F59AB5' },
  { name: 'Butterscotch', flavour: 'Big, golden, crunchy', image: '/brand/mascots/butterscotch.webp', w: 646, h: 603, tint: '#FFE7C2', scoop: '#F2B54A' },
  { name: 'Chocolate', flavour: 'Rich and a little wild', image: '/brand/mascots/chocolate-cheer.webp', w: 824, h: 900, tint: '#EFDFD3', scoop: '#7A4A30' },
  { name: 'Mango', flavour: 'Tall, sunny, tropical', image: '/brand/mascots/mango.webp', w: 333, h: 900, tint: '#FFEFC7', scoop: '#FFC23D' },
  { name: 'Black Currant', flavour: 'Deep purple and bold', image: '/brand/mascots/black-currant.webp', w: 571, h: 688, tint: '#E6DDF4', scoop: '#7B4E9E' },
];

// Figures supplied by Blue Mont (client feedback, October 2026).
export const STATS = [
  { value: '20', unit: 'yrs', label: 'making ice cream and kulfi in Lalitpur' },
  { value: '12+', unit: '', label: 'districts and cities stock us' },
  { value: '10,000+', unit: '', label: 'people love our ice cream' },
  { value: '3', unit: 'brands', label: "Top Kulfi, Baeley's & Blissberry" },
];

// Products shown with their MRP in the value-for-money section.
export const VALUE_PICKS = [
  { name: 'Kulfusion', price: 'Rs 60', image: '/brand/products/blissberry-taro.webp', w: 348, h: 900, alt: 'Blissberry Kulfusion taro stick' },
  { name: 'Super Sundae', price: 'Rs 90', image: '/brand/products/sundae-strawberry.webp', w: 486, h: 900, alt: "Baeley's Super Sundae strawberry ice cream" },
  { name: 'Monstro Cone', price: 'Rs 100', image: '/brand/products/cone-21-love.webp', w: 345, h: 863, alt: "Baeley's 21 Love Monstro Cone ice cream" },
];

export const VALUE_POINTS = [
  'Real milk, standardised and hygienic batches',
  'Made to DFTQC requirements in our own factory',
  'New flavours on the way all the time',
];

// Customer reviews. Only add real ones, quoted with the customer's
// permission. Entries marked `placeholder` show in development so the layout
// can be checked, and are never rendered in a production build; with no real
// reviews the section is left out entirely.
export const REVIEWS = [
  { placeholder: true, quote: 'Placeholder: a real customer review goes here.', name: 'Customer name', place: 'Town' },
  { placeholder: true, quote: 'Placeholder: a second real review, ideally about value for money.', name: 'Customer name', place: 'Town' },
  { placeholder: true, quote: 'Placeholder: a third real review, maybe about Top Kulfi.', name: 'Customer name', place: 'Town' },
];
