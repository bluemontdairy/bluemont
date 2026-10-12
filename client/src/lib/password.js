// Admin password rules, following NIST SP 800-63B: length over composition
// rules, a block list of common passwords, and nothing that contains the
// account's own name or email. CommonJS so scripts/create-admin.mjs can use it.

const MIN_LENGTH = 12;
// bcrypt only reads the first 72 bytes; longer passwords would be silently
// truncated, so they are refused instead.
const MAX_BYTES = 72;

const COMMON = new Set(
  [
    'password', 'password1', 'password123', 'passw0rd', 'qwerty', 'qwertyuiop', 'qwerty123', '123456789012',
    '1234567890', '12345678910', 'iloveyou', 'admin', 'admin123', 'administrator', 'welcome', 'welcome123',
    'letmein', 'changeme', 'trustno1', 'abc123', 'abcdefghijkl', 'football', 'baseball', 'superman', 'princess',
    'sunshine', 'dragon', 'monkey', 'master', 'nepal', 'nepal123', 'kathmandu', 'lalitpur', 'bluemont',
    'bluemontdairy', 'baeleys', 'icecream', 'kulfi', 'topkulfi', 'blissberry',
  ].map((p) => p.toLowerCase())
);

/** Returns an error message, or '' when the password is acceptable. */
function passwordProblem(password, { email = '', username = '' } = {}) {
  if (typeof password !== 'string' || password.length === 0) return 'Enter a password.';
  if (password.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES) return 'Use at most 72 characters.';

  const lower = password.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, '').replace(/\d+$/, '');
  if (COMMON.has(lower) || COMMON.has(stripped)) return 'That password is too common. Pick something less guessable.';
  if (/^(.)\1+$/.test(password)) return 'Don’t use one character repeated.';
  if (new Set(password).size < 5) return 'Use a wider mix of characters.';

  const local = String(email).toLowerCase().split('@')[0];
  if (local.length >= 3 && lower.includes(local)) return 'Don’t include your email address in the password.';
  const name = String(username).toLowerCase();
  if (name.length >= 3 && lower.includes(name)) return 'Don’t include your username in the password.';
  return '';
}

module.exports = { passwordProblem, MIN_LENGTH };
