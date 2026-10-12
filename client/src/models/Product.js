const mongoose = require('mongoose');

// Brand, line and format are free strings (not enums) so staff can add a new
// brand such as "Fresh Dairy" or a "Tubs" format from the admin panel without
// a code change. The catalog builds its filters from whatever values exist.
// Category is a real reference: it decides which extra fields (attributes)
// the product has.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: {
      // slug, e.g. "baeleys", "blissberry", "topkulfi", "fresh-dairy"
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    line: {
      // product line shown on the card, e.g. "Big Cup", "Family Pack"
      type: String,
      required: true,
      trim: true,
    },
    format: {
      // filter group, e.g. "Cones", "Cups", "Bars", "Packs", "Bulk"
      type: String,
      required: true,
      trim: true,
    },
    volume: {
      type: String,
      default: '',
      trim: true,
    },
    mrp: {
      // NPR; null shows "MRP on request"
      type: Number,
      default: null,
      min: 0,
    },
    // Packshot on Cloudinary. publicId lets the old file be deleted when it
    // is replaced; width/height keep the layout steady while it loads.
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    imageWidth: { type: Number, default: null },
    imageHeight: { type: Number, default: null },
    description: {
      type: String,
      default: '',
    },
    // Values for the category's own fields, keyed by attribute key, e.g.
    // { flavour: 'Mango', productType: 'Ice cream' }.
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Shown in "Our latest favourites" on the homepage.
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

productSchema.index({ brand: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
