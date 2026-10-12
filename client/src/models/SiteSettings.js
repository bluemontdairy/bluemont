const mongoose = require('mongoose');

// A single document (_id "site") holding the values set in Admin → Site
// settings. Fields are defined in lib/settingsSchema.js; anything not stored
// falls back to its default.
const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'site' },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
