import crypto from 'node:crypto';

// AES-256-GCM encryption for secrets stored in the database (two-step sign-in
// keys). The key comes from AUTH_SECRET in .env: if
// it lived in the database too, a copy of the database would hold both the
// lock and the key.
//
// Plain module (no server-only marker) so Node scripts can use it as well.

const rawSecret = () => {
  const value = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be set to at least 32 characters (in .env)');
  return value;
};

// Kept as "totp:" so two-step sign-in secrets sealed earlier still open.
const key = () => crypto.createHash('sha256').update(`totp:${rawSecret()}`).digest();

export function seal(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

export function unseal(sealed) {
  if (!sealed) return null;
  try {
    const [iv, tag, data] = String(sealed).split('.').map((p) => Buffer.from(p, 'base64url'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
