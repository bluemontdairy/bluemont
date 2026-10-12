// Home page content. Images are not set here: product photos come from the
// products themselves (Admin → Products) and every other picture is a site
// media slot (Admin → Site images, keys in lib/siteMediaSlots.js).
//
// - "Our latest favourites" shows products marked Featured.
// - The Top Kulfi shelf shows the Kulfi category's products that have a photo.
// - VALUE_PICKS names products; their photo and MRP come from the catalog.

// Every product family Blue Mont makes. The home page renders one card per
// entry, so a new category (yoghurt, cheese...) is a new object here.
export const BRANDS = [
  {
    slug: 'topkulfi',
    name: 'Top Kulfi',
    category: 'Kulfi',
    logo: 'logo.topkulfi',
    text: 'The Rs 10 and Rs 20 kulfi Nepal grew up on. Titaura, Chocodip, Chocom and fruit popsicles, made the way we always have.',
    image: 'home.brand-topkulfi',
    alt: 'Top Kulfi Chocodip kulfi',
    tint: '#FFE3D6',
  },
  {
    slug: 'baeleys',
    name: "Baeley's",
    category: 'Ice cream',
    logo: 'logo.baeleys',
    text: 'Cones, sundaes, bars and family tubs, with a monster on every pack. Premium ice cream at a price that makes sense.',
    image: 'home.brand-baeleys',
    alt: "Baeley's 21 Love Monstro Cone ice cream",
    tint: '#DCEBFA',
  },
  {
    slug: 'blissberry',
    name: 'Blissberry',
    category: 'Kulfusion',
    text: 'Traditional kulfi blended with modern flavours: mango, honeydew, blueberry and taro.',
    image: 'home.brand-blissberry',
    alt: 'Blissberry Kulfusion mango stick',
    tint: '#E6DDF4',
  },
];

// `scoop` tints the ice-cream scoop drawn beside each monster.
export const MONSTERS = [
  { name: 'The Main Monster', flavour: 'Chief taster', image: 'monster.main', tint: '#DCEBFA', scoop: '#FFF3D6' },
  { name: 'Vanilla', flavour: 'Soft and creamy', image: 'monster.vanilla', tint: '#FFF4CC', scoop: '#FFF0C2' },
  { name: 'Strawberry', flavour: 'Berry wild', image: 'monster.strawberry', tint: '#FCE1EA', scoop: '#F59AB5' },
  { name: 'Butterscotch', flavour: 'Big, golden, crunchy', image: 'monster.butterscotch', tint: '#FFE7C2', scoop: '#F2B54A' },
  { name: 'Chocolate', flavour: 'Rich and a little wild', image: 'monster.chocolate', tint: '#EFDFD3', scoop: '#7A4A30' },
  { name: 'Mango', flavour: 'Tall, sunny, tropical', image: 'monster.mango', tint: '#FFEFC7', scoop: '#FFC23D' },
  { name: 'Black Currant', flavour: 'Deep purple and bold', image: 'monster.black-currant', tint: '#E6DDF4', scoop: '#7B4E9E' },
];

// The numbers strip. Figures come from Admin → Site settings ("Homepage
// numbers"); `stats` is getSiteInfo().stats.
export const buildStats = (stats) => [
  { value: stats.years, unit: 'yrs', label: 'making ice cream and kulfi in Lalitpur' },
  { value: stats.districts, unit: '', label: 'districts and cities stock us' },
  { value: stats.fans, unit: '', label: 'people love our ice cream' },
  { value: '3', unit: 'brands', label: "Top Kulfi, Baeley's & Blissberry" },
];

// Products shown with their MRP in the value-for-money section, by brand and
// product name. A pick is skipped if the product is missing or has no photo.
export const VALUE_PICKS = [
  { label: 'Kulfusion', brand: 'blissberry', product: 'Taro Kulfusion' },
  { label: 'Super Sundae', brand: 'baeleys', product: 'Strawberry Super Sundae' },
  { label: 'Monstro Cone', brand: 'baeleys', product: '21 Love Monstro Cone' },
];

export const VALUE_POINTS = [
  'Real milk, standardised and hygienic batches',
  'Made to DFTQC requirements in our own factory',
  'New flavours on the way all the time',
];

