// Home page content. Prices are MRP (NPR) from the Blue Mont scope document;
// packshots and mascots are cut from the Baeley's Figma file (public/brand).

export const FAVORITES = [
  { name: 'Blissberry Kulfusion Taro', tag: 'Blissberry', price: 'Rs 60', image: '/brand/products/blissberry-taro.webp', w: 348, h: 900 },
  { name: 'Super Sundae Strawberry', tag: "Baeley's", price: 'Rs 90', image: '/brand/products/sundae-strawberry.webp', w: 486, h: 900 },
  { name: '21 Love Monstro Cone', tag: "Baeley's", price: 'Rs 100', image: '/brand/products/cone-21-love.webp', w: 345, h: 863 },
  { name: 'Oreo Bar', tag: "Baeley's", price: 'Rs 80', image: '/brand/products/oreo-bar.webp', w: 407, h: 900 },
  { name: 'Nutty Crunch', tag: "Baeley's", price: 'Rs 75', image: '/brand/products/nutty-crunch.webp', w: 424, h: 900 },
  { name: 'Family Pack 1000 ml', tag: "Baeley's", price: 'from Rs 390', image: '/brand/products/family-pack-1000ml.webp', w: 729, h: 833 },
  { name: 'Blissberry Kulfusion Mango', tag: 'Blissberry', price: 'Rs 60', image: '/brand/products/blissberry-mango.webp', w: 347, h: 900 },
  { name: 'Super Sundae Chocolate', tag: "Baeley's", price: 'Rs 100', image: '/brand/products/sundae-chocolate.webp', w: 478, h: 900 },
  { name: 'Chocobar', tag: "Baeley's", price: 'Rs 50', image: '/brand/products/chocobar.webp', w: 432, h: 900 },
  { name: 'Tub Box', tag: "Baeley's", price: 'from Rs 1,250', image: '/brand/products/tub-box.webp', w: 708, h: 900 },
];

export const MONSTERS = [
  { name: 'The Main Monster', flavour: 'Chief taster', image: '/brand/mascots/yeti-main.webp', w: 630, h: 743, tint: '#DCEBFA' },
  { name: 'Vanilla', flavour: 'Soft and creamy', image: '/brand/mascots/vanilla.webp', w: 657, h: 686, tint: '#FFF4CC' },
  { name: 'Strawberry', flavour: 'Berry wild', image: '/brand/mascots/strawberry.webp', w: 790, h: 799, tint: '#FCE1EA' },
  { name: 'Butterscotch', flavour: 'Big, golden, crunchy', image: '/brand/mascots/butterscotch.webp', w: 646, h: 603, tint: '#FFE7C2' },
  { name: 'Chocolate', flavour: 'Rich and a little wild', image: '/brand/mascots/chocolate-cheer.webp', w: 824, h: 900, tint: '#EFDFD3' },
  { name: 'Mango', flavour: 'Tall, sunny, tropical', image: '/brand/mascots/mango.webp', w: 333, h: 900, tint: '#FFEFC7' },
  { name: 'Black Currant', flavour: 'Deep purple and bold', image: '/brand/mascots/black-currant.webp', w: 571, h: 688, tint: '#E6DDF4' },
];

export const PARTNER_POINTS = [
  { title: 'High-margin range', text: 'Impulse treats from Rs 20 to Rs 100, family packs and catering tubs.' },
  { title: 'Branded freezer', text: 'Deep freezers placed with qualifying partners, based on footfall.' },
  { title: 'Cold-chain restock', text: 'Scheduled deliveries across Lalitpur, Kathmandu and Bhaktapur.' },
  { title: 'POS support', text: 'Flex banners, menu boards, freezer stickers and posters.' },
];

export const whatsappUrl = (message) => {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9770000000000';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

// Facts already stated elsewhere on the page / in the scope document.
export const STATS = [
  { value: '20', unit: 'yrs', label: 'of Lalitpur dairy heritage' },
  { value: '3', unit: 'brands', label: "Baeley's, Blissberry & Top Kulfi" },
  { value: 'Rs 20', unit: '', label: 'is where the treats start' },
  { value: '3', unit: 'districts', label: 'on our cold-chain routes' },
];

export const QUALITY_POINTS = [
  'Standardised, hygienic batches',
  'Made to DFTQC requirements',
  'Unbroken cold chain to your freezer',
];
