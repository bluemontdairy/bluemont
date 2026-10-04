// Builds notification emails from untrusted form input.
//
// Nodemailer sends the `html` string exactly as given, so anything a visitor
// types (e.g. `<a href="https://evil.example">Click to verify</a>`) would
// render as real markup in the management inbox. Every value is escaped
// before it is placed in HTML, and a plain-text part is sent alongside.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

// Subjects are headers; strip line breaks and cap length. (Nodemailer also
// encodes headers, so this is defence in depth, not the only guard.)
export const safeSubject = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, 150);

/**
 * @param {string} title
 * @param {Array<[string, unknown]>} fields  label/value pairs; arrays are joined
 * @returns {{ html: string, text: string }}
 */
export function buildFieldsEmail(title, fields) {
  const rows = fields.map(([label, raw]) => [label, Array.isArray(raw) ? raw.join(', ') : raw || 'N/A']);

  const html = `
    <h2 style="font-family:Arial,sans-serif;color:#1F4F88">${escapeHtml(title)}</h2>
    <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="vertical-align:top;color:#555"><strong>${escapeHtml(label)}</strong></td>` +
            `<td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>`;

  const text = `${title}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n`;

  return { html, text };
}
