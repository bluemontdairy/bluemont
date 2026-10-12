// Category-wise product schema: each category lists the extra fields its
// products carry, and these helpers validate both the field definitions
// (admin → Categories) and a product's values for them (admin → Products).
// CommonJS so the Mongoose models and Node scripts can require it too.

const ATTRIBUTE_TYPES = ['text', 'number', 'select', 'multiselect', 'boolean'];

const ATTRIBUTE_TYPE_LABELS = {
  text: 'Text',
  number: 'Number',
  select: 'One of a list',
  multiselect: 'Several from a list',
  boolean: 'Yes / no',
};

class SchemaError extends Error {}

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// "Fat content (%)" -> "fatContent"
const attributeKey = (label) => {
  const words = String(label || '')
    .replace(/\(.*?\)/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  const key = words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('').slice(0, 40);
  return /^[a-z]/.test(key) ? key : `field${key}`.slice(0, 40);
};

/** Validates and normalises a category's attribute definitions. */
function validateAttributeDefs(defs) {
  if (!Array.isArray(defs)) return [];
  if (defs.length > 30) throw new SchemaError('A category can have at most 30 fields.');

  const seen = new Set();
  return defs.map((raw, i) => {
    const label = clean(raw?.label, 60);
    if (!label) throw new SchemaError(`Field ${i + 1} needs a name.`);
    const key = clean(raw?.key, 40) || attributeKey(label);
    if (!/^[a-z][a-zA-Z0-9]{0,39}$/.test(key)) throw new SchemaError(`"${label}" has an invalid key.`);
    if (seen.has(key)) throw new SchemaError(`Two fields share the key "${key}". Rename one of them.`);
    seen.add(key);

    const type = ATTRIBUTE_TYPES.includes(raw?.type) ? raw.type : 'text';
    let options = [];
    if (type === 'select' || type === 'multiselect') {
      const list = Array.isArray(raw?.options) ? raw.options : String(raw?.options || '').split(',');
      options = [...new Set(list.map((o) => clean(o, 60)).filter(Boolean))].slice(0, 50);
      if (options.length < 2) throw new SchemaError(`"${label}" needs at least two options.`);
    }

    return {
      key,
      label,
      type,
      options,
      unit: type === 'number' ? clean(raw?.unit, 20) : '',
      required: raw?.required === true,
      showOnCard: raw?.showOnCard === true,
    };
  });
}

/**
 * Validates a product's attribute values against its category's fields.
 * Unknown keys are dropped; empty optional values are left out.
 */
function validateAttributeValues(defs, values) {
  const input = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
  const out = {};

  for (const def of defs || []) {
    const raw = input[def.key];
    const empty = raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && raw.length === 0);

    if (def.type === 'boolean') {
      if (raw === true || raw === 'true') out[def.key] = true;
      else if (raw === false || raw === 'false') out[def.key] = false;
      else if (def.required) throw new SchemaError(`${def.label} is required.`);
      continue;
    }

    if (empty) {
      if (def.required) throw new SchemaError(`${def.label} is required.`);
      continue;
    }

    switch (def.type) {
      case 'number': {
        const n = Number(raw);
        if (!Number.isFinite(n)) throw new SchemaError(`${def.label} must be a number.`);
        out[def.key] = n;
        break;
      }
      case 'select': {
        if (!def.options.includes(raw)) throw new SchemaError(`${def.label} must be one of: ${def.options.join(', ')}.`);
        out[def.key] = raw;
        break;
      }
      case 'multiselect': {
        const list = (Array.isArray(raw) ? raw : [raw]).filter((v) => def.options.includes(v));
        if (list.length === 0 && def.required) throw new SchemaError(`Choose at least one ${def.label}.`);
        if (list.length) out[def.key] = [...new Set(list)];
        break;
      }
      default: {
        const text = clean(String(raw), 200);
        if (!text && def.required) throw new SchemaError(`${def.label} is required.`);
        if (text) out[def.key] = text;
      }
    }
  }
  return out;
}

/** Human-readable value, e.g. "40 g", "Yes", "Mango, Litchi". */
function formatAttributeValue(def, value) {
  if (value === undefined || value === null || value === '') return '';
  if (def.type === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return def.unit ? `${value} ${def.unit}` : String(value);
}

// Starting categories. The migration and seed scripts create them if missing;
// after that they are edited from the admin panel.
const DEFAULT_CATEGORIES = [
  {
    slug: 'ice-cream',
    name: 'Ice Cream',
    description:
      "Baeley's ice cream: cones, cups, sundaes, bars and family tubs made with real milk in Lalitpur. Premium quality at an honest price.",
    seoTitle: "Ice Cream in Nepal — Baeley's Cones, Cups, Sundaes & Tubs",
    seoDescription:
      "Baeley's ice cream by Blue Mont Dairy: cones, cups, sundaes, bars and family tubs with MRP in NPR. Wholesale supply across Nepal.",
    sortOrder: 10,
    attributes: [
      { key: 'flavour', label: 'Flavour', type: 'text', showOnCard: true },
      { key: 'productType', label: 'Ice cream or frozen dessert', type: 'select', options: ['Ice cream', 'Frozen dessert'] },
    ],
  },
  {
    slug: 'kulfi',
    name: 'Kulfi',
    description:
      'Top Kulfi: the Rs 10 and Rs 20 kulfi Nepal grew up on. Khuwa, titaura, chocodip, chocom and fruit popsicles, made the way we always have.',
    seoTitle: 'Kulfi in Nepal — Top Kulfi Titaura, Chocodip, Chocom & Popsicles',
    seoDescription:
      'Top Kulfi by Blue Mont Dairy: the classic kulfi and popsicles sold across Nepal for 20 years. See the full range.',
    sortOrder: 20,
    attributes: [
      { key: 'flavour', label: 'Flavour', type: 'text', showOnCard: true },
      { key: 'base', label: 'Base', type: 'select', options: ['Khuwa (milk)', 'Fruit', 'Chocolate coated'] },
    ],
  },
  {
    slug: 'kulfusion',
    name: 'Kulfusion',
    description: 'Blissberry Kulfusion: traditional kulfi blended with modern flavours like mango, honeydew, blueberry and taro.',
    seoTitle: 'Blissberry Kulfusion — Kulfi Meets Modern Flavours',
    seoDescription: 'Blissberry Kulfusion sticks by Blue Mont Dairy: mango, honeydew, blueberry and taro. MRP and wholesale supply in Nepal.',
    sortOrder: 30,
    attributes: [{ key: 'flavour', label: 'Flavour', type: 'text', showOnCard: true }],
  },
];

// Which default category an existing product belongs to, by brand.
const DEFAULT_CATEGORY_FOR_BRAND = { baeleys: 'ice-cream', topkulfi: 'kulfi', blissberry: 'kulfusion' };

module.exports = {
  ATTRIBUTE_TYPES,
  ATTRIBUTE_TYPE_LABELS,
  SchemaError,
  slugify,
  attributeKey,
  validateAttributeDefs,
  validateAttributeValues,
  formatAttributeValue,
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_FOR_BRAND,
};
