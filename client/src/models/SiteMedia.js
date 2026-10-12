const mongoose = require('mongoose');

// One uploaded file per site image slot (see lib/siteMediaSlots.js). A slot
// with no document falls back to the built-in file.
const siteMediaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
    width: Number,
    height: Number,
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SiteMedia || mongoose.model('SiteMedia', siteMediaSchema);
