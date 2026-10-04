// Small input guards for public form endpoints. Only whitelisted fields are
// read from the request body, so callers can't set things like `status`.

export class ValidationError extends Error {}

export const str = (value, { max = 200, required = false, label = 'Field' } = {}) => {
  const out = typeof value === 'string' ? value.trim() : '';
  if (required && !out) throw new ValidationError(`${label} is required.`);
  if (out.length > max) throw new ValidationError(`${label} is too long (max ${max} characters).`);
  return out;
};

export const oneOf = (value, allowed, label = 'Field') => {
  if (!allowed.includes(value)) throw new ValidationError(`${label} is not a valid option.`);
  return value;
};

export const someOf = (values, allowed, label = 'Field') => {
  const list = Array.isArray(values) ? values.filter((v) => allowed.includes(v)) : [];
  if (list.length === 0) throw new ValidationError(`Choose at least one option for ${label}.`);
  return [...new Set(list)];
};

// Nepali mobiles are 10 digits starting 97/98; allow an optional +977 prefix
// and common separators, and return the digits only.
export const nepaliMobile = (value, label = 'Mobile number') => {
  const digits = str(value, { max: 25, required: true, label }).replace(/[\s\-()]/g, '').replace(/^\+?977/, '');
  if (!/^9[78]\d{8}$/.test(digits)) throw new ValidationError(`${label} must be a 10-digit Nepali mobile (98XXXXXXXX).`);
  return digits;
};

export const email = (value, label = 'Email') => {
  const out = str(value, { max: 120, label });
  if (out && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out)) throw new ValidationError(`${label} is not valid.`);
  return out;
};
