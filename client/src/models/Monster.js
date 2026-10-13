const mongoose = require('mongoose');

// A character in the homepage's "Meet the monsters" carousel, managed in
// Admin → Monsters. Each one has a picture, a card colour and a flavour
// scoop: either an uploaded scoop picture or a drawn scoop in `scoopColor`.
const monsterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    flavour: { type: String, default: '', trim: true, maxlength: 60 }, // line under the name
    image: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    imageWidth: { type: Number, default: null },
    imageHeight: { type: Number, default: null },
    tint: { type: String, default: '#DCEBFA', match: /^#[0-9a-fA-F]{6}$/ },
    scoopColor: { type: String, default: '#FFF0C2', match: /^#[0-9a-fA-F]{6}$/ },
    scoopImage: { type: String, default: '' },
    scoopImagePublicId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Monster || mongoose.model('Monster', monsterSchema);
