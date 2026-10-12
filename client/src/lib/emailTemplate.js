import { escapeHtml } from './email';
import { SITE } from './site';

// The branded email layout, built to feel like the website:
//
//   ┌──────────────────────────────────────────┐
//   │ HERO  logo                               │  blue gradient, like the
//   │       [YELLOW PILL EYEBROW]      monster │  homepage hero; a mascot
//   │       BIG WHITE LILITA TITLE    peeking ↑│  peeks up from the edge
//   ├──────────────────────────────────────────┤
//   │ • • • • sprinkles • • • •                │
//   │ Greeting                                 │
//   │ Paragraphs                               │
//   │ ┌ details card ┐                         │
//   │ (YELLOW PILL BUTTON  ➜)                  │  same button as the site
//   │ Button not working? copy-paste link      │
//   │ ┃ note with icon                         │
//   ├──────────────────────────────────────────┤
//   │ FOOTER  dark blue, brand + links         │
//   └──────────────────────────────────────────┘
//     why you got this · ©
//
// Email clients ignore most modern CSS, so this is table-based with inline
// styles, max 600px wide, and stacks on phones (the mascot hides there).
// Web fonts load in Apple Mail / iOS; Gmail and Outlook fall back to Arial
// Black / Arial, which keep the same shape. Pure functions, no database:
// lib/emailLayout.js resolves the logo and mascot images.
//
// Every value is escaped here: callers pass plain text, never HTML.

const C = {
  blue: '#2D6BB2',
  blueDark: '#1F4F88',
  blueLight: '#6FA0DA',
  mist: '#E3EEF9',
  yellow: '#FFDE72',
  yellowDeep: '#F2C23E',
  cream: '#FFF7DC',
  ink: '#15335A',
  paper: '#EEF3F9',
  body: '#3F4A5A',
  muted: '#7A8699',
  pink: '#E84B8A',
  orange: '#E8832A',
};

const DISPLAY = "'Lilita One', 'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const TEXT = "'Nunito', 'Segoe UI', Helvetica, Arial, sans-serif";

const e = escapeHtml;

// Sprinkles divider: a row of little candy-coloured dots.
const SPRINKLES = [C.pink, C.yellowDeep, C.blueLight, C.orange, C.blue, C.pink, C.yellowDeep, C.blueLight];
const sprinkles = () => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
    <tr>
      ${SPRINKLES.map(
        (c, i) =>
          `<td style="padding-right:7px;"><span style="display:block;width:${i % 3 === 1 ? 14 : 8}px;height:8px;border-radius:8px;background:${c};font-size:0;line-height:0;">&nbsp;</span></td>`
      ).join('')}
    </tr>
  </table>`;

const paragraph = (text, { lead = false } = {}) =>
  `<p style="margin:0 0 16px;font-family:${TEXT};font-size:${lead ? 18 : 16}px;line-height:1.6;color:${lead ? C.ink : C.body};${lead ? 'font-weight:700;' : ''}">${e(text)}</p>`;

// The site's yellow pill button with the round arrow chip. Outlook gets a
// square-cornered version of the same colours. `fallback` adds the raw link
// for sign-in emails, where a button broken by a mail filter means being
// locked out; `secondary` is a quieter second action.
const button = ({ label, url }, { fallback, secondary }) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 14px;">
    <tr>
      <td bgcolor="${C.yellow}" style="border-radius:999px;border-bottom:3px solid ${C.yellowDeep};mso-padding-alt:14px 26px;">
        <a href="${e(url)}" target="_blank"
           style="display:inline-block;padding:13px 14px 13px 28px;font-family:${DISPLAY};font-size:17px;line-height:22px;letter-spacing:0.6px;text-transform:uppercase;color:${C.ink};text-decoration:none;border-radius:999px;">
          ${e(label)}&nbsp;&nbsp;<span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:26px;background:${C.ink};color:${C.yellow};text-align:center;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;vertical-align:middle;">&rsaquo;</span>
        </a>
      </td>
    </tr>
  </table>
  ${
    secondary
      ? `<p style="margin:0 0 22px;font-family:${TEXT};font-size:14px;font-weight:700;"><a href="${e(secondary.url)}" target="_blank" style="color:${C.blue};text-decoration:none;">${e(secondary.label)} &rarr;</a></p>`
      : ''
  }
  ${
    fallback
      ? `<p style="margin:0 0 26px;font-family:${TEXT};font-size:12px;line-height:1.5;color:${C.muted};">
    Button not working? Copy this link into your browser:<br>
    <a href="${e(url)}" target="_blank" style="color:${C.blue};word-break:break-all;">${e(url)}</a>
  </p>`
      : `<div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>`
  }`;

const detailCard = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:6px 0 24px;border:1px solid ${C.mist};border-radius:18px;border-collapse:separate;background:#FFFFFF;">
    ${rows
      .map(
        ([label, value], i) => `
    <tr>
      <td style="padding:14px 20px;${i ? `border-top:1px dashed #D3E2F3;` : ''}">
        <div style="font-family:${TEXT};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.blueLight};">${e(label)}</div>
        <div style="margin-top:4px;font-family:${TEXT};font-size:16px;line-height:1.5;color:${C.ink};font-weight:700;white-space:pre-wrap;">${e(
          Array.isArray(value) ? value.join(' · ') : value || '—'
        )}</div>
      </td>
    </tr>`
      )
      .join('')}
  </table>`;

const NOTE_ICONS = { lock: '&#128274;', info: '&#128161;', clock: '&#9200;', heart: '&#128155;' };

const noteBox = (text, icon = 'info') => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;border-collapse:separate;">
    <tr>
      <td width="44" valign="top" style="padding:14px 0 14px 16px;background:${C.cream};border-radius:14px 0 0 14px;font-size:20px;line-height:24px;">${NOTE_ICONS[icon] || NOTE_ICONS.info}</td>
      <td style="padding:14px 18px 14px 6px;background:${C.cream};border-radius:0 14px 14px 0;font-family:${TEXT};font-size:14px;line-height:1.55;color:${C.body};">${e(text)}</td>
    </tr>
  </table>`;

/**
 * @param {object} o
 * @param {string} o.preheader        inbox preview line
 * @param {string} [o.eyebrow]        yellow pill above the title
 * @param {string} o.title            big hero heading
 * @param {string} [o.greeting]       "Hi Sita," (bold lead line)
 * @param {string[]} [o.paragraphs]
 * @param {Array<[string, unknown]>} [o.rows]   details card
 * @param {{label: string, url: string}} [o.button]
 * @param {{label: string, url: string}} [o.secondary]  quieter second action
 * @param {boolean} [o.linkFallback]  print the button's URL too (sign-in emails)
 * @param {string} [o.note]           highlighted aside
 * @param {'lock'|'info'|'clock'|'heart'} [o.noteIcon]
 * @param {string} [o.reason]         why the reader got this email (small print)
 * @param {string} [o.logoUrl]        resolved by lib/emailLayout.js
 * @param {string} [o.mascotUrl]      resolved by lib/emailLayout.js
 * @param {string} [o.legalName]      from Admin → Site settings
 * @param {string} [o.contactEmail]   from Admin → Site settings
 * @param {string} [o.instagram]      from Admin → Site settings
 * @param {string} o.siteUrl          from Admin → Site settings
 */
export function renderEmail({
  preheader,
  eyebrow = 'Blue Mont Dairy',
  title,
  greeting,
  paragraphs = [],
  rows,
  button: btn,
  secondary,
  linkFallback = false,
  note,
  noteIcon,
  reason,
  logoUrl,
  mascotUrl,
  legalName = SITE.legalName,
  contactEmail,
  instagram,
  siteUrl,
}) {
  const year = new Date().getFullYear();
  const siteHost = siteUrl.replace(/^https?:\/\//, '');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${e(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    a { text-decoration-skip-ink: auto; }
    @media (max-width: 620px) {
      .bm-outer { padding: 0 !important; }
      .bm-card { border-radius: 0 !important; }
      .bm-pad { padding-left: 24px !important; padding-right: 24px !important; }
      .bm-hero { padding: 24px 24px 0 !important; }
      .bm-title { font-size: 30px !important; line-height: 34px !important; }
      .bm-mascot { display: none !important; width: 0 !important; max-height: 0 !important; overflow: hidden !important; }
      .bm-hero-text { padding-bottom: 26px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.paper};">${e(preheader)}${'&#8199;&#65279;&#847;'.repeat(30)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="background:${C.paper};">
    <tr>
      <td class="bm-outer" align="center" style="padding:32px 16px 40px;">

        <table role="presentation" class="bm-card" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#FFFFFF;border-radius:28px;overflow:hidden;box-shadow:0 18px 40px rgba(21,51,90,0.12);">

          <!-- Hero -->
          <tr>
            <td class="bm-hero" bgcolor="${C.blue}"
                style="padding:28px 32px 0 36px;background:${C.blue};background-image:radial-gradient(circle at 85% 10%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0) 45%),linear-gradient(155deg, ${C.blueLight} 0%, ${C.blue} 42%, ${C.blueDark} 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="bm-hero-text" valign="top" style="padding-bottom:34px;">
                    ${
                      logoUrl
                        ? `<img src="${e(logoUrl)}" width="78" alt="Blue Mont Dairy" style="display:block;width:78px;height:auto;border:0;outline:none;">`
                        : `<div style="font-family:${DISPLAY};font-size:24px;color:#FFFFFF;letter-spacing:1px;">BLUE MONT</div>`
                    }
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 12px;">
                      <tr>
                        <td bgcolor="${C.yellow}" style="padding:6px 14px;border-radius:999px;font-family:${TEXT};font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${C.ink};">${e(eyebrow)}</td>
                      </tr>
                    </table>
                    <h1 class="bm-title" style="margin:0;font-family:${DISPLAY};font-weight:400;font-size:36px;line-height:40px;letter-spacing:0.5px;text-transform:uppercase;color:#FFFFFF;text-shadow:0 2px 0 rgba(21,51,90,0.25);">${e(title)}</h1>
                  </td>
                  ${
                    mascotUrl
                      ? `<td class="bm-mascot" width="150" valign="bottom" align="right" style="width:150px;padding-left:12px;">
                    <img src="${e(mascotUrl)}" width="150" alt="" style="display:block;width:150px;height:auto;border:0;outline:none;">
                  </td>`
                      : ''
                  }
                </tr>
              </table>
            </td>
          </tr>
          <tr><td height="6" bgcolor="${C.yellow}" style="height:6px;background:${C.yellow};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td class="bm-pad" style="padding:30px 40px 30px 36px;">
              ${sprinkles()}
              ${greeting ? paragraph(greeting, { lead: true }) : ''}
              ${paragraphs.map((p) => paragraph(p)).join('')}
              ${rows?.length ? detailCard(rows) : ''}
              ${btn ? button(btn, { fallback: linkFallback, secondary }) : ''}
              ${note ? noteBox(note, noteIcon) : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="bm-pad" bgcolor="${C.ink}" style="padding:24px 40px 26px 36px;background:${C.ink};">
              <div style="font-family:${DISPLAY};font-size:18px;letter-spacing:0.5px;text-transform:uppercase;color:#FFFFFF;">${e(SITE.name)}</div>
              <div style="margin-top:4px;font-family:${TEXT};font-size:13px;line-height:1.5;color:#B9CDE6;">Ice cream &amp; kulfi from Lalitpur, Nepal &middot; Top Kulfi, Baeley&#8217;s &amp; Blissberry</div>
              ${
                contactEmail
                  ? `<div style="margin-top:2px;font-family:${TEXT};font-size:13px;line-height:1.5;"><a href="mailto:${e(contactEmail)}" style="color:#B9CDE6;text-decoration:none;">${e(contactEmail)}</a></div>`
                  : ''
              }
              <div style="margin-top:12px;font-family:${TEXT};font-size:13px;font-weight:700;">
                <a href="${e(siteUrl)}" target="_blank" style="color:${C.yellow};text-decoration:none;">${e(siteHost)}</a>
                <span style="color:#4E6E96;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
                <a href="${e(`${siteUrl}/products`)}" target="_blank" style="color:${C.yellow};text-decoration:none;">Products</a>
                ${
                  instagram
                    ? `<span style="color:#4E6E96;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span><a href="${e(instagram)}" target="_blank" style="color:${C.yellow};text-decoration:none;">Instagram</a>`
                    : ''
                }
                <span style="color:#4E6E96;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
                <a href="${e(`${siteUrl}/admin`)}" target="_blank" style="color:${C.yellow};text-decoration:none;">Admin</a>
              </div>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:18px 24px 0;font-family:${TEXT};font-size:12px;line-height:1.6;color:${C.muted};">
              ${reason ? `${e(reason)}<br>` : ''}&copy; ${year} ${e(legalName)}
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text version: same content, no markup. */
export function renderText({ title, greeting, paragraphs = [], button: btn, secondary, rows, note, reason, siteUrl }) {
  return [
    title.toUpperCase(),
    '',
    ...(greeting ? [greeting, ''] : []),
    ...paragraphs.flatMap((p) => [p, '']),
    ...(rows?.length ? [...rows.map(([l, v]) => `${l}: ${Array.isArray(v) ? v.join(', ') : v || '—'}`), ''] : []),
    ...(btn ? [`${btn.label}: ${btn.url}`, ''] : []),
    ...(secondary ? [`${secondary.label}: ${secondary.url}`, ''] : []),
    ...(note ? [note, ''] : []),
    `${SITE.name} · ${siteUrl}`,
    ...(reason ? [reason] : []),
  ].join('\n');
}
