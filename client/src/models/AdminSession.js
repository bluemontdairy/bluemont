const mongoose = require('mongoose');

// Server-side admin sessions. The cookie holds a random token; only its
// SHA-256 hash is stored here. Deleting a row signs that browser out at once,
// which a stateless JWT can't do.
const adminSessionSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // Password accepted but the 6-digit authenticator code is still due.
    pendingMfa: { type: Boolean, default: false },
    mfaAttempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

// MongoDB removes expired sessions on its own.
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.AdminSession || mongoose.model('AdminSession', adminSessionSchema);
