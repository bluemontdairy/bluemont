// Display names and ordering for catalog taxonomy. Unknown values (a brand or
// format added later from the admin panel) still work: they get a title-cased
// label and sort after the known ones.

export const BRAND_LABELS = {
  baeleys: "Baeley's",
  blissberry: 'Blissberry',
  topkulfi: 'Top Kulfi',
};

export const FORMAT_ORDER = ['Cones', 'Cups', 'Sundaes', 'Bars', 'Sticks', 'Kulfi', 'Popsicles', 'Packs', 'Bulk'];

export const FORMAT_LABELS = {
  Packs: 'Packs (Tubs)',
  Bulk: 'Bulk / Food Service',
};

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const brandLabel = (slug) => BRAND_LABELS[slug] || titleCase(String(slug || ''));
export const formatLabel = (format) => FORMAT_LABELS[format] || format;

export const brandSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const rank = (list, value) => {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
};

export const sortBrands = (slugs) =>
  [...slugs].sort((a, b) => rank(Object.keys(BRAND_LABELS), a) - rank(Object.keys(BRAND_LABELS), b) || a.localeCompare(b));

export const sortFormats = (formats) =>
  [...formats].sort((a, b) => rank(FORMAT_ORDER, a) - rank(FORMAT_ORDER, b) || a.localeCompare(b));

export const formatMrp = (mrp) =>
  typeof mrp === 'number' ? `Rs ${mrp.toLocaleString('en-IN')}` : 'MRP on request';
