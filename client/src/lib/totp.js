import 'server-only';
import crypto from 'node:crypto';

// RFC 6238 time-based one-time passwords (6 digits, 30 s, SHA-1), the format
// Google Authenticator, Microsoft Authenticator, 1Password etc. all use.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP = 30;

const base32Encode = (buf) => {
  let bits = '';
  for (const byte of buf) bits += byte.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) out += ALPHABET[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  return out;
};

const base32Decode = (str) => {
  let bits = '';
  for (const ch of str.replace(/=+$/, '').toUpperCase()) {
    const v = ALPHABET.indexOf(ch);
    if (v === -1) throw new Error('Invalid base32');
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
};

export const generateTotpSecret = () => base32Encode(crypto.randomBytes(20));

const codeAt = (secret, step) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(bin % 1_000_000).padStart(6, '0');
};

/**
 * Checks a code, allowing one step of clock drift either way. Returns the
 * matched time step (store it to stop the same code being used twice), or 0.
 */
export function verifyTotp(secret, code, lastUsedStep = 0) {
  const clean = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean) || !secret) return 0;
  const now = Math.floor(Date.now() / 1000 / STEP);
  for (const step of [now - 1, now, now + 1]) {
    if (step <= lastUsedStep) continue;
    const expected = codeAt(secret, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) return step;
  }
  return 0;
}

export const otpauthUrl = ({ secret, account, issuer = 'Blue Mont Admin' }) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${STEP}`;
