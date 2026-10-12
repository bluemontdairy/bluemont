// Builds every icon and social share image from the brand artwork in
// public/brand. Run after the logo or packshots change:
//
//   node scripts/generate-brand-assets.mjs
//
// Writes:
//   src/app/favicon.ico            16, 32, 48 px  browser tabs, bookmarks, Google results
//   src/app/icon.png               192 px         high-DPI tabs (round badge)
//   src/app/apple-icon.png         180 px         iOS home screen, iMessage/Safari previews
//   public/icons/icon-192.png      192 px         Android home screen (manifest)
//   public/icons/icon-512.png      512 px         Android splash screen, install prompt
//   public/icons/icon-maskable-512.png            Android adaptive icon (any mask shape)
//   public/og.jpg                  1200 × 630     default share image (home and fallback)
//   public/og-products.jpg         1200 × 630     /products and category pages
//   public/og-partner.jpg          1200 × 630     /partner
//
// Share images keep the logo and headline in the middle, with artwork on
// the edges, so the square thumbnails WhatsApp and Telegram crop still read.
// Fonts in scripts/brand-assets/fonts are Lilita One and Nunito (SIL Open
// Font License).

import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { ImageResponse } = require('next/og');
const React = require('react');
const h = React.createElement;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = (p) => path.join(ROOT, 'public/brand', p);
const out = (p) => path.join(ROOT, p);

const BLUE = '#2D6BB2';
const BLUE_DARK = '#1F4F88';
const BLUE_SKY = '#4F8FD6';
const YELLOW = '#FFDE72';

const LOGO = brand('logo/bluemont-white.webp');

// ---------- icons ----------

/** White logo centred on a transparent square, `scale` of the side wide. */
async function logoLayer(size, scale) {
  const w = Math.round(size * scale);
  const logo = await sharp(LOGO).trim().resize({ width: w, height: w, fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(logo).metadata();
  return { input: logo, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) };
}

/** Round badge as in the site header: blue disc, yellow ring, white logo. */
async function badge(size) {
  const r = size / 2;
  const ring = Math.max(1, Math.round(size * 0.055));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${r}" cy="${r}" r="${r}" fill="${YELLOW}"/>
    <circle cx="${r}" cy="${r}" r="${r - ring}" fill="${BLUE}"/>
  </svg>`;
  // Tiny sizes get a bigger logo: at 16 px every pixel of white counts.
  const scale = size <= 32 ? 0.8 : 0.66;
  return sharp(Buffer.from(svg)).composite([await logoLayer(size, scale)]).png().toBuffer();
}

/** Full-bleed blue square with the logo inside `safe` of the side. */
async function tile(size, safe) {
  const bg = await sharp({ create: { width: size, height: size, channels: 4, background: BLUE } }).png().toBuffer();
  return sharp(bg).composite([await logoLayer(size, safe)]).png().toBuffer();
}

/** ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function buildIcons() {
  await mkdir(out('public/icons'), { recursive: true });
  const fav = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await badge(size) })));
  await writeFile(out('src/app/favicon.ico'), ico(fav));
  await writeFile(out('src/app/icon.png'), await badge(192));
  // iOS draws its own rounded corners and fills transparency with black, so
  // the Apple icon is an opaque full-bleed square.
  await writeFile(out('src/app/apple-icon.png'), await tile(180, 0.72));
  await writeFile(out('public/icons/icon-192.png'), await badge(192));
  await writeFile(out('public/icons/icon-512.png'), await badge(512));
  // Maskable: launchers may crop to a circle 80% of the side, so the logo
  // stays within the middle 60%.
  await writeFile(out('public/icons/icon-maskable-512.png'), await tile(512, 0.6));
}

// ---------- share images ----------

const W = 1200;
const H = 630;

const dataUri = (buf, type = 'png') => `data:image/${type};base64,${buf.toString('base64')}`;

/** Trimmed PNG data URI of a brand image, fitted inside w × h. */
async function art(file, w, hgt) {
  const buf = await sharp(brand(file)).trim().resize({ width: w, height: hgt, fit: 'inside' }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { src: dataUri(buf), width: meta.width, height: meta.height };
}

/** Blue gradient with the site's swirl texture, as a JPEG data URI. */
async function background() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_DARK}"/><stop offset="0.6" stop-color="${BLUE}"/><stop offset="1" stop-color="${BLUE_SKY}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  const texture = await sharp(brand('texture-swirl.webp'))
    .ensureAlpha(0.35)
    .composite([{ input: Buffer.from([255, 255, 255, 26]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const buf = await sharp(Buffer.from(svg)).composite([{ input: texture, tile: true, blend: 'over' }]).jpeg({ quality: 90 }).toBuffer();
  return dataUri(buf, 'jpeg');
}

const img = (a, style = {}) => h('img', { src: a.src, width: a.width, height: a.height, style });

/**
 * One share card: centred logo, eyebrow, two-line headline and a subline,
 * with artwork standing along the left and right edges.
 */
function card({ bg, logo, eyebrow, line1, line2, sub, left, right }) {
  return h(
    'div',
    { style: { width: W, height: H, display: 'flex', position: 'relative', fontFamily: 'Nunito' } },
    h('img', { src: bg, width: W, height: H, style: { position: 'absolute', left: 0, top: 0 } }),
    ...left.map(({ a, x, y, rotate = 0 }) =>
      img(a, { position: 'absolute', left: x, bottom: y, transform: `rotate(${rotate}deg)` })
    ),
    ...right.map(({ a, x, y, rotate = 0 }) =>
      img(a, { position: 'absolute', right: x, bottom: y, transform: `rotate(${rotate}deg)` })
    ),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 190,
          top: 0,
          width: 820,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
        },
      },
      img(logo, { marginBottom: 26 }),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 800, letterSpacing: 4, color: YELLOW, marginBottom: 10 } },
        h('div', { style: { width: 30, height: 4, borderRadius: 4, background: YELLOW, marginRight: 14 } }),
        eyebrow,
        h('div', { style: { width: 30, height: 4, borderRadius: 4, background: YELLOW, marginLeft: 14 } })
      ),
      h('div', { style: { fontFamily: 'Lilita One', fontSize: 64, lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 5px 0 rgba(12,34,66,0.3)' } }, line1),
      h('div', { style: { fontFamily: 'Lilita One', fontSize: 64, lineHeight: 1.05, whiteSpace: 'nowrap', color: YELLOW, textShadow: '0 5px 0 rgba(12,34,66,0.3)' } }, line2),
      h('div', { style: { marginTop: 20, fontSize: 27, fontWeight: 600, color: 'rgba(255,255,255,0.94)' } }, sub)
    )
  );
}

async function render(element, file, fonts) {
  const res = new ImageResponse(element, { width: W, height: H, fonts });
  const png = Buffer.from(await res.arrayBuffer());
  // JPEG keeps it well under WhatsApp's ~300 KB limit for the large preview.
  const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  await writeFile(out(file), jpg);
  return `${file} ${Math.round(jpg.length / 1024)} KB`;
}

async function buildShareImages() {
  const font = (f) => readFile(path.join(ROOT, 'scripts/brand-assets/fonts', f));
  const fonts = [
    { name: 'Lilita One', data: await font('LilitaOne-Regular.ttf'), weight: 400, style: 'normal' },
    { name: 'Nunito', data: await font('Nunito-SemiBold.ttf'), weight: 600, style: 'normal' },
    { name: 'Nunito', data: await font('Nunito-ExtraBold.ttf'), weight: 800, style: 'normal' },
  ];
  const bg = await background();
  const logo = await art('logo/bluemont-white.webp', 230, 150);

  const results = [];

  results.push(
    await render(
      card({
        bg,
        logo,
        eyebrow: 'LALITPUR · NEPAL',
        line1: 'PREMIUM ICE CREAM',
        line2: '& KULFI FOR NEPAL',
        sub: "Top Kulfi · Baeley's · Blissberry",
        left: [
          { a: await art('mascots/yeti-cone.webp', 250, 300), x: 10, y: 10 },
          { a: await art('products/kulfi-chocodip.webp', 90, 230), x: 205, y: 30, rotate: 12 },
        ],
        right: [
          { a: await art('products/cone-21-love.webp', 110, 290), x: 150, y: 40, rotate: -10 },
          { a: await art('mascots/butterscotch.webp', 200, 210), x: 0, y: 10 },
        ],
      }),
      'public/og.jpg',
      fonts
    )
  );

  results.push(
    await render(
      card({
        bg,
        logo,
        eyebrow: 'PRODUCTS & PRICES',
        line1: 'ICE CREAM & KULFI',
        line2: 'PRICE LIST (MRP)',
        sub: 'Cones · Sundaes · Kulfi · Kulfusion · Tubs',
        left: [
          { a: await art('products/kulfi-titaura.webp', 80, 240), x: 40, y: 40, rotate: -8 },
          { a: await art('products/sundae-strawberry.webp', 170, 230), x: 110, y: 20 },
        ],
        right: [
          { a: await art('products/blissberry-mango.webp', 100, 260), x: 150, y: 30, rotate: 8 },
          { a: await art('products/cone-chocolate.webp', 100, 270), x: 40, y: 30, rotate: -6 },
        ],
      }),
      'public/og-products.jpg',
      fonts
    )
  );

  results.push(
    await render(
      card({
        bg,
        logo,
        eyebrow: 'FOR SHOPS & CAFÉS',
        line1: 'STOCK BLUE MONT',
        line2: 'IN YOUR SHOP',
        sub: 'Branded freezers · Cold-chain restock',
        left: [{ a: await art('mascots/yeti-jump.webp', 270, 300), x: 10, y: 20 }],
        right: [
          { a: await art('products/family-pack-1000ml.webp', 190, 180), x: 30, y: 30 },
          { a: await art('products/kulfi-chocom.webp', 80, 220), x: 200, y: 50, rotate: 10 },
        ],
      }),
      'public/og-partner.jpg',
      fonts
    )
  );

  return results;
}

await buildIcons();
console.log('icons written');
for (const line of await buildShareImages()) console.log(line);
