const mongoose = require('mongoose');

// Customer reviews shown on the homepage ("Loved across Nepal"). Managed in
// Admin → Reviews. Only add real reviews, quoted with the customer's
// permission (`consent`).
const reviewSchema = new mongoose.Schema(
  {
    quote: { type: String, required: true, trim: true, maxlength: 400 },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    place: { type: String, default: '', trim: true, maxlength: 60 }, // town or shop
    rating: { type: Number, default: null, min: 1, max: 5 },
    // Optional photo of the customer (Cloudinary).
    photo: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    consent: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
