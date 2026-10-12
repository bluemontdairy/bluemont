// Escaping for emails built from untrusted form input.
//
// Nodemailer sends the `html` string exactly as given, so anything a visitor
// types (e.g. `<a href="https://evil.example">Click to verify</a>`) would
// render as real markup in the management inbox. lib/emailLayout.js escapes
// every value with escapeHtml() before placing it in HTML.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

// Subjects are headers; strip line breaks and cap length. (Nodemailer also
// encodes headers, so this is defence in depth, not the only guard.)
export const safeSubject = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, 150);
