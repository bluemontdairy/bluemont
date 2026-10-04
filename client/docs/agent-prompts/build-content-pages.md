# Prompt: build the About, Quality & Food Safety, and Contact pages

Copy everything below the line into a new agent session started in `/home/niqqa/Projects/baeleys/client`.

---

You're working on the Blue Mont Dairy website: Next.js 16 (App Router, JavaScript, CSS Modules, Turbopack) in `/home/niqqa/Projects/baeleys/client`. Build the three public pages the scope document requires that don't exist yet:

| Route | Scope section | Must cover |
|---|---|---|
| `/about` | 2.0 About Blue Mont Dairy | Factory infrastructure in Lalitpur, hygienic processing standards, cold-chain distribution across Kathmandu Valley, company background (about 20 years of dairy heritage), and the three brands: Baeley's (playful premium treats with mascots), Blissberry ("Kulfusion": traditional kulfi texture with modern ice cream flavours) and Top Kulfi (heritage Khuwa kulfi, fruit popsicles, titaura bars). |
| `/quality` | 5.0 Quality & Food Safety | DFTQC regulatory compliance, milk standardisation, hygienic handling, cold-chain integrity. |
| `/contact` | 6.0 Contact Us | Interactive Google Maps embed of the Lalitpur factory, direct wholesale phone numbers, management emails, and a general inquiry form. |

## Read first

1. `AGENTS.md`. This Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing code (metadata: `01-app/01-getting-started/14-metadata-and-og-images.md`; JSON-LD: `01-app/02-guides/json-ld.md`). Request APIs (`params`, `searchParams`, `cookies()`) are async.
2. `src/lib/site.js`. This is the single source of business details (`SITE.phone`, `SITE.email`, `SITE.whatsapp`, `SITE.address`, `SITE.geo`), SEO keywords, `PUBLIC_ROUTES` for the sitemap, `pageSocial()` for Open Graph and Twitter tags, `jsonLd()` and `organizationJsonLd()`. Use these values. Never hard-code a phone number, email or address in a page.
3. `src/app/products/page.jsx` and `src/app/partner/page.jsx`, for the patterns to copy: a server-component page exporting `metadata`, with a separate `'use client'` component only for interactive parts (see `partner/PartnerForm.jsx`).
4. `src/app/globals.css`, for the design tokens (`--primary`, `--ink`, `--brand-yellow`, `--blue-mist`, spacing and radius scales, fonts `--font-outfit` / `--font-display` / `--font-nunito`). Brand imagery lives in `public/brand/` (logo, mascots, product packshots). Visual reference: `../design/reference-design.png`.

## Requirements

**Layout and design**
- The site header is `position: fixed`. Give each page's top-level wrapper `padding-top: 150px`, matching `.page` in `src/app/partner/page.module.css`.
- Mobile-first: more than 85% of traffic is mobile. No horizontal scroll at 375px, tap targets at least 44px, and readable at 16px body size.
- Images: use `next/image` with `.webp` assets from `public/brand/`, a meaningful `alt`, and `sizes`. Don't redesign or alter the mascot artwork.
- CSS Modules only. Every selector must include a local class (e.g. `.form input`, not bare `input`), or Turbopack fails the build with "Selector is not pure".

**SEO (each page)**
- `export const metadata` with a specific `title` (the layout appends "| Blue Mont Dairy"), a description of 140–160 characters that targets local commercial terms (e.g. "dairy manufacturer Nepal", "ice cream factory Lalitpur", "ice cream wholesale Kathmandu"), `alternates: { canonical: '/about' }` and so on, and `...pageSocial({ title, description, path })`.
- Exactly one `<h1>` per page, with a logical h2/h3 order.
- JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />`: `AboutPage` for /about, `WebPage` for /quality, and `ContactPage` for /contact. Each should reference the organisation as `{ '@id': \`${SITE_URL}/#organization\` }` rather than duplicating it (the root layout already outputs the Organization/LocalBusiness node).
- Add `/about`, `/quality` and `/contact` to `PUBLIC_ROUTES` in `src/lib/site.js` so they appear in `sitemap.xml`.

**Contact page**
- Map: a Google Maps embed `<iframe>` built from `SITE.geo` (no API key needed: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`), with `title="Blue Mont Dairy factory location, Lalitpur"`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, and a responsive 16:9 or 4:3 wrapper. Add a "Get directions" link to `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`.
- Contact details: `tel:` and `https://wa.me/` links from `SITE`, plus `mailto:` for `SITE.email`. Mark any number that is still a placeholder with a `{/* TODO */}` comment, not invented digits.
- Inquiry form (`'use client'` component). POST JSON to the existing `/api/contact` endpoint. Do not change the API. Fields:
  - `name`: required, max 80 characters
  - `phone`: required. A 10-digit Nepali mobile; the API accepts `98XXXXXXXX`, `+977 98…` or `977-98…`
  - `email`: optional
  - `message`: required, max 3000 characters
  - `website`: an empty honeypot input, visually hidden with `aria-hidden` and `tabIndex={-1}`. Copy `.honeypot` from `partner/page.module.css`.
  - The API returns `{ ok: true }` (201), or `{ message }` with status 400/429 on errors. Show that message to the user.
  - Use real `<label htmlFor>`s, `autoComplete` attributes, a `role="alert"` error box, and a `role="status"` success state. Mirror `PartnerForm.jsx`.
- Add a short call-out linking shops to `/partner` ("Want to stock our ice cream? Apply for a freezer") so B2B inquiries don't go through the general form.

**Content accuracy**
- Don't invent facts: no licence numbers, certificate names, capacities, years, staff counts, awards or addresses that aren't in `src/lib/site.js` or this prompt. Where a real figure is needed, write neutral copy and leave a `{/* TODO: confirm with Blue Mont — … */}` comment, then list every TODO in your final summary.
- Prices, if mentioned, must match the catalog. Prefer linking to `/products` over repeating prices.

**Out of scope (owned by other work)**
- Don't edit `src/app/page.jsx`, `src/components/Header.*`, `src/components/Footer.*`, `src/lib/homeContent.js`, `src/app/layout.js`, anything under `src/app/admin/`, `src/app/api/`, `src/models/`, or `src/lib/` other than adding routes to `PUBLIC_ROUTES` in `site.js`.
- The header and footer still link to `/#story`, `/#quality` and `/#contact`. Don't change them. In your final summary, tell the user they now need pointing at `/about`, `/quality` and `/contact`.

## Done means

- `npx eslint src` and `npx next build` both pass.
- With the dev server running (`npm run dev`, port 3000), each page renders at desktop width and at 375px with no horizontal scroll. The contact form shows a validation error for a bad phone number, and on success a document appears in the `contacts` collection (MongoDB at `MONGODB_URI` from `.env.local`).
- `curl localhost:3000/sitemap.xml` lists the three new URLs, and each page's HTML has a canonical link, `og:image`, a description and its JSON-LD block.
- Your final message lists the files created, every TODO left for Blue Mont to confirm, and the header/footer link change still needed.
