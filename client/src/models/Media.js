const mongoose = require('mongoose');

// Product images uploaded from the admin panel. Stored in MongoDB (already
// converted to .webp and resized) so uploads work on any host, including
// ones with a read-only filesystem. Served by /media/[id].
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, default: '' },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Media || mongoose.model('Media', mediaSchema);
