import 'server-only';
import crypto from 'node:crypto';

// Small crypto helpers for auth.

/** A URL-safe random token with 256 bits of entropy. */
export const randomToken = () => crypto.randomBytes(32).toString('base64url');

export const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

/** Constant-time string comparison. */
export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Encryption for secrets stored in the database lives in ./sealing.js.
export { seal, unseal } from './sealing';
