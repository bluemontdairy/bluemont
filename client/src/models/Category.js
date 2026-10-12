const mongoose = require('mongoose');

const { ATTRIBUTE_TYPES } = require('../lib/categorySchema');

// A product category (Ice Cream, Kulfi, Kulfusion, later Yoghurt, Cheese...).
// Each category defines its own extra product fields in `attributes`: an ice
// cream has "Flavour" and "Ice cream or frozen dessert", a yoghurt might have
// "Fat %" and "Set or stirred". Products in the category store their values
// in Product.attributes, and lib/categorySchema.js validates them.
const attributeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, match: /^[a-z][a-zA-Z0-9]{0,39}$/ },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    type: { type: String, required: true, enum: ATTRIBUTE_TYPES },
    options: { type: [String], default: [] }, // for select / multiselect
    unit: { type: String, default: '', trim: true, maxlength: 20 }, // e.g. "g", "%", "kcal"
    required: { type: Boolean, default: false },
    showOnCard: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9]+(-[a-z0-9]+)*$/ },
    description: { type: String, default: '', maxlength: 1000 },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    attributes: { type: [attributeSchema], default: [] },
    // Overrides for the category page's <title> and meta description.
    seoTitle: { type: String, default: '', maxlength: 70 },
    seoDescription: { type: String, default: '', maxlength: 170 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
