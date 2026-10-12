const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_COST = 12;

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'staff'],
      default: 'staff',
    },
    isActive: { type: Boolean, default: true },

    // Brute-force protection: after MAX_FAILED_LOGINS wrong passwords the
    // account is locked until lockUntil, whatever IP the attempts come from.
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },

    // Password reset: only a SHA-256 hash of the emailed token is stored, so a
    // database leak can't be used to reset passwords.
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpires: { type: Date, default: null, select: false },

    // Optional two-step sign-in (TOTP, e.g. Google Authenticator). The secret
    // is encrypted with AUTH_SECRET; see lib/secretBox.js.
    totpEnabled: { type: Boolean, default: false },
    totpSecret: { type: String, default: null, select: false },
    totpPendingSecret: { type: String, default: null, select: false },
    totpLastStep: { type: Number, default: 0, select: false }, // blocks code replay

    // Set when a super admin invites the account from Admin → Admins.
    invitedBy: { type: String, default: '' },
    invitedAt: { type: Date, default: null },

    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving. Mongoose 9 no longer passes `next` to pre
// hooks, so return early instead of calling it.
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

// Match password. Needs the document loaded with .select('+password').
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// True when the stored hash was made with a lower cost than today's, so it
// can be upgraded transparently on the next successful sign-in.
adminSchema.methods.needsRehash = function () {
  const rounds = Number(String(this.password).split('$')[2]);
  return Number.isFinite(rounds) && rounds < BCRYPT_COST;
};

adminSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
module.exports.BCRYPT_COST = BCRYPT_COST;
