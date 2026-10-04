const mongoose = require('mongoose');

// Brand and format are free strings (not enums) so staff can add a new line
// such as "Fresh Dairy" or a "Tubs" format from the admin panel without a
// code change. The catalog builds its filters from whatever values exist.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      // slug, e.g. "baeleys", "blissberry", "topkulfi", "fresh-dairy"
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
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
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
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
  }
);

productSchema.index({ brand: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
