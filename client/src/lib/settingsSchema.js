// Business settings edited in Admin → Site settings and stored in the
// database: the site's address, contact details, social links, notification
// addresses, homepage numbers and business details. Server
// credentials (database, mail server, Cloudinary, AUTH_SECRET) stay in .env.
// One list drives the form, the validation and the defaults. Safe for client
// components: it holds field definitions, never values.
//
// A field left empty falls back to `fallback`. `secret` fields are stored
// encrypted and never sent to the browser.

export const SETTINGS_GROUPS = [
  { id: 'site', title: 'Site address', note: 'The website’s public address. Used for links in emails, password links, Google and social sharing.' },
  { id: 'contact', title: 'Contact', note: 'Shown in the footer and used by every “Chat on WhatsApp” button.' },
  { id: 'social', title: 'Social media', note: 'Full links to your pages. An icon only appears on the website when its link is filled in.' },
  { id: 'notifications', title: 'Email notifications', note: 'Who gets an email when a shop applies or someone sends a message.' },
  { id: 'homepage', title: 'Homepage numbers', note: 'The figures in the hero, the numbers strip and the partner section.' },
  { id: 'business', title: 'Business details (for Google)', note: 'Used in search results and Google Maps data. Customers rarely see these directly.' },
];

export const SETTINGS_FIELDS = [
  // Site address
  { key: 'siteUrl', group: 'site', label: 'Website address', type: 'siteurl', placeholder: 'https://bluemont.com.np', hint: 'Starts with https:// (http://localhost:3000 while developing). Until it’s set, the address the site is visited on is used.' },

  // Contact
  { key: 'whatsappNumber', group: 'contact', label: 'WhatsApp number', type: 'whatsapp', placeholder: '9779851065362', hint: 'Country code + number, digits only (Nepal: 977…). Every WhatsApp button opens a chat with this number.' },
  { key: 'whatsappMessage', group: 'contact', label: 'WhatsApp opening message', type: 'text', max: 200, fallback: 'Hi Blue Mont, I’d like to ask about your products.', hint: 'Pre-filled when a visitor taps the floating WhatsApp button.' },
  { key: 'phone', group: 'contact', label: 'Phone number', type: 'tel', placeholder: '+977-1-5555555', hint: 'Shown in the footer; tapping it calls this number.' },
  { key: 'email', group: 'contact', label: 'Display email', type: 'email', fallback: 'info@bluemont.com.np', hint: 'The public contact address on the website.' },
  { key: 'addressLine', group: 'contact', label: 'Address (as shown)', type: 'text', max: 160, fallback: 'Lalitpur, Kathmandu Valley, Nepal' },
  { key: 'mapUrl', group: 'contact', label: 'Google Maps link', type: 'url', placeholder: 'https://maps.app.goo.gl/…', hint: 'Optional. Makes the address clickable.' },
  { key: 'openingHours', group: 'contact', label: 'Opening hours', type: 'text', max: 120, placeholder: 'Sun–Fri, 9am–6pm', hint: 'Optional. Shown under the address.' },

  // Social
  { key: 'instagramUrl', group: 'social', label: 'Instagram', type: 'url', domain: 'instagram.com', fallback: 'https://instagram.com/bluemont_dairy', placeholder: 'https://instagram.com/bluemont_dairy' },
  { key: 'facebookUrl', group: 'social', label: 'Facebook', type: 'url', domain: 'facebook.com', placeholder: 'https://facebook.com/yourpage' },
  { key: 'tiktokUrl', group: 'social', label: 'TikTok', type: 'url', domain: 'tiktok.com', placeholder: 'https://www.tiktok.com/@yourpage' },
  { key: 'youtubeUrl', group: 'social', label: 'YouTube', type: 'url', domain: 'youtube.com', placeholder: 'https://youtube.com/@yourchannel' },

  // Notifications
  { key: 'notifyEmails', group: 'notifications', label: 'Send notifications to', type: 'emails', placeholder: 'sales@bluemont.com.np, owner@gmail.com', hint: 'One or more addresses, separated by commas. Empty: sent to the website’s own mail account.' },

  // Homepage numbers
  { key: 'statYears', group: 'homepage', label: 'Years in business', type: 'text', max: 12, fallback: '20', hint: 'e.g. 20' },
  { key: 'statDistricts', group: 'homepage', label: 'Districts & cities', type: 'text', max: 12, fallback: '12+', hint: 'e.g. 12+' },
  { key: 'statFans', group: 'homepage', label: 'People who love the ice cream', type: 'text', max: 12, fallback: '10,000+', hint: 'e.g. 10,000+' },

  // Business details
  { key: 'legalName', group: 'business', label: 'Registered company name', type: 'text', max: 100, fallback: 'Blue Mont Dairy Pvt. Ltd.' },
  { key: 'foundingYear', group: 'business', label: 'Year founded', type: 'year', fallback: '2006' },
  { key: 'streetAddress', group: 'business', label: 'Street address', type: 'text', max: 120, fallback: 'Lalitpur' },
  { key: 'locality', group: 'business', label: 'City', type: 'text', max: 60, fallback: 'Lalitpur' },
  { key: 'region', group: 'business', label: 'Province', type: 'text', max: 60, fallback: 'Bagmati Province' },
  { key: 'postalCode', group: 'business', label: 'Postal code', type: 'text', max: 12, fallback: '44700' },
  { key: 'latitude', group: 'business', label: 'Map pin latitude', type: 'latitude', fallback: '27.6644', hint: 'From Google Maps: right-click the factory → the first number.' },
  { key: 'longitude', group: 'business', label: 'Map pin longitude', type: 'longitude', fallback: '85.3188', hint: 'The second number.' },
  { key: 'areaServed', group: 'business', label: 'Areas served', type: 'list', fallback: 'Lalitpur, Kathmandu, Bhaktapur', hint: 'Cities or districts, separated by commas.' },
];

export const SETTINGS_KEYS = new Set(SETTINGS_FIELDS.map((f) => f.key));
export const SECRET_KEYS = new Set(SETTINGS_FIELDS.filter((f) => f.secret).map((f) => f.key));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks one submitted value. Returns { value } (normalised; '' means "use
 * the default") or { error }.
 */
export function checkSetting(field, raw) {
  const value = typeof raw === 'string' ? raw.trim() : raw == null ? '' : String(raw).trim();
  if (!value) return { value: '' };
  const max = field.max || 300;
  if (value.length > max) return { error: `${field.label} is too long (max ${max} characters).` };

  switch (field.type) {
    case 'siteurl': {
      let url;
      try {
        url = new URL(value);
      } catch {
        return { error: 'Website address must be a full address, e.g. https://bluemont.com.np' };
      }
      const local = ['localhost', '127.0.0.1'].includes(url.hostname);
      if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return { error: 'Website address must start with https://' };
      return { value: url.origin };
    }
    case 'host':
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return { error: `${field.label} looks wrong, e.g. smtp.gmail.com` };
      return { value: value.toLowerCase() };
    case 'port': {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 65535) return { error: 'Port must be a number such as 465 or 587.' };
      return { value: String(n) };
    }
    case 'slug':
      if (!/^[a-z0-9][a-z0-9_-]{0,62}$/i.test(value)) return { error: `${field.label} can only contain letters, numbers, - and _.` };
      return { value };
    case 'digits':
      if (!/^\d{6,30}$/.test(value)) return { error: `${field.label} should be digits only.` };
      return { value };
    case 'password':
      return { value };
    case 'whatsapp': {
      const digits = value.replace(/[\s()+-]/g, '');
      if (!/^\d{8,15}$/.test(digits)) return { error: 'WhatsApp number: digits only with the country code, e.g. 9779851065362.' };
      if (/^9[78]\d{8}$/.test(digits)) return { error: 'Add the country code in front: 977 followed by the mobile number.' };
      return { value: digits };
    }
    case 'tel':
      if (!/^[+\d][\d\s()-]{5,24}$/.test(value)) return { error: 'Phone number can only contain digits, spaces, dashes, brackets and a leading +.' };
      return { value };
    case 'email':
      if (!EMAIL.test(value)) return { error: `${field.label} is not a valid email.` };
      return { value: value.toLowerCase() };
    case 'emails': {
      const list = [...new Set(value.split(/[,;\s]+/).map((v) => v.trim().toLowerCase()).filter(Boolean))];
      const bad = list.find((v) => !EMAIL.test(v));
      if (bad) return { error: `"${bad}" is not a valid email.` };
      if (list.length > 10) return { error: 'Up to 10 notification addresses.' };
      return { value: list.join(', ') };
    }
    case 'url': {
      let url;
      try {
        url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      } catch {
        return { error: `${field.label}: enter a full link, e.g. ${field.placeholder || 'https://…'}` };
      }
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return { error: `${field.label} must be a web link.` };
      if (field.domain && !(url.hostname === field.domain || url.hostname.endsWith(`.${field.domain}`))) {
        return { error: `${field.label} link should be on ${field.domain}.` };
      }
      url.protocol = 'https:';
      return { value: url.toString() };
    }
    case 'year': {
      const y = Number(value);
      if (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear()) return { error: 'Enter a year such as 2006.' };
      return { value: String(y) };
    }
    case 'latitude':
    case 'longitude': {
      const n = Number(value);
      const limit = field.type === 'latitude' ? 90 : 180;
      if (!Number.isFinite(n) || Math.abs(n) > limit) return { error: `${field.label} must be a number between -${limit} and ${limit}.` };
      return { value: String(n) };
    }
    case 'list':
      return { value: value.split(',').map((v) => v.trim()).filter(Boolean).join(', ') };
    default:
      return { value };
  }
}

/**
 * Stored values merged over the defaults, as a plain { key: value } map.
 * Secret fields are left out: read them on the server with
 * getPrivateConfig() from lib/siteSettings.js.
 */
export function resolveSettings(stored = {}) {
  const out = {};
  for (const f of SETTINGS_FIELDS) if (!f.secret) out[f.key] = (stored[f.key] ?? '') || f.fallback || '';
  return out;
}

/** wa.me link for a WhatsApp number and message. */
export const whatsappHref = (number, message = '') =>
  `https://wa.me/${String(number || '').replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** tel: link from a display phone number. */
export const telHref = (phone) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;
