// Every image and video on the website that isn't a product photo. Each slot
// can be replaced from Admin → Site images (uploads go to Cloudinary). Until
// an admin uploads one, the built-in file in /public is used, if there is
// one. Product photos are not here: they belong to each product.
//
// To add a slot: add an entry here, then read it with media.get('<key>') in
// the component. w/h are the fallback's natural size; uploads store their own.

export const SLOT_GROUPS = ['Logos', 'Hero', 'Homepage', 'Monsters', 'Backgrounds & sharing'];

export const SITE_MEDIA_SLOTS = [
  // Logos
  { key: 'logo.bluemont', group: 'Logos', label: 'Blue Mont logo (white)', hint: 'Header, footer and homepage. White artwork on a transparent background.', fallback: '/brand/logo/bluemont-white.webp', w: 439, h: 354 },
  { key: 'logo.bluemont-tile', group: 'Logos', label: 'Blue Mont logo tile', hint: 'Solid square-ish logo that Google shows in search results.', fallback: '/brand/logo/bluemont-blue.webp', w: 570, h: 470 },
  { key: 'logo.badge', group: 'Logos', label: "Baeley's badge", hint: 'Admin panel, and on products that have no photo yet.', fallback: '/brand/logo/badge.webp', w: 600, h: 600 },
  { key: 'logo.baeleys', group: 'Logos', label: "Baeley's wordmark", hint: 'Brand card on the homepage.', fallback: '/brand/logo/wordmark.webp', w: 960, h: 440 },
  { key: 'logo.topkulfi', group: 'Logos', label: 'Top Kulfi wordmark', hint: 'Top Kulfi section and brand card.', fallback: '/brand/logo/top-kulfi-wordmark.webp', w: 960, h: 690 },

  // Hero
  { key: 'hero.video', group: 'Hero', kind: 'video', label: 'Hero background video', hint: 'Muted loop behind the homepage headline. MP4, 16:9, ideally under 10 MB.' },
  { key: 'hero.poster', group: 'Hero', label: 'Hero video poster', hint: 'Shown while the video loads. Leave empty to use the video’s first frame.' },
  { key: 'hero.mascot-left', group: 'Hero', label: 'Hero mascot (left)', hint: 'Monster holding a cone, bottom left of the hero.', fallback: '/brand/mascots/yeti-cone.webp', w: 717, h: 900 },
  { key: 'hero.kulfi', group: 'Hero', label: 'Hero kulfi', hint: 'Kulfi next to the left mascot.', fallback: '/brand/products/kulfi-chocodip.webp', w: 293, h: 900 },
  { key: 'hero.mascot-right', group: 'Hero', label: 'Hero mascot (right)', hint: 'Monster on the right of the hero.', fallback: '/brand/mascots/butterscotch.webp', w: 646, h: 603 },

  // Homepage
  { key: 'home.value-mascot', group: 'Homepage', label: 'Value section mascot', hint: 'Waving monster beside the value-for-money products. Also used in the mobile menu and footer.', fallback: '/brand/mascots/yeti-wave.webp', w: 840, h: 900 },
  { key: 'home.brand-topkulfi', group: 'Homepage', label: 'Top Kulfi brand card', hint: 'Product shot on the Top Kulfi card in “Our family of brands”.', fallback: '/brand/products/kulfi-chocodip.webp', w: 293, h: 900 },
  { key: 'home.brand-baeleys', group: 'Homepage', label: "Baeley's brand card", hint: "Product shot on the Baeley's card.", fallback: '/brand/products/cone-21-love.webp', w: 345, h: 863 },
  { key: 'home.brand-blissberry', group: 'Homepage', label: 'Blissberry brand card', hint: 'Product shot on the Blissberry card.', fallback: '/brand/products/blissberry-mango.webp', w: 347, h: 900 },
  { key: 'home.quality-product', group: 'Homepage', label: 'Quality section product', hint: 'Large product shot in the blue “Quality you can taste” band.', fallback: '/brand/products/tub-box.webp', w: 708, h: 900 },
  { key: 'home.quality-mascot', group: 'Homepage', label: 'Quality section mascot', hint: 'Monster next to the quality product.', fallback: '/brand/mascots/chocolate-cheer.webp', w: 824, h: 900 },
  { key: 'home.scoop-mascot', group: 'Homepage', label: '“Latest scoop” mascot', hint: 'Monster on the yellow social media band.', fallback: '/brand/mascots/strawberry.webp', w: 790, h: 799 },
  { key: 'home.partner-mascot', group: 'Homepage', label: 'Partner section mascot', hint: 'Jumping monster beside “Want us in your place?”.', fallback: '/brand/mascots/yeti-jump.webp', w: 941, h: 900 },

  // Meet the monsters
  { key: 'monster.main', group: 'Monsters', label: 'The Main Monster', fallback: '/brand/mascots/yeti-main.webp', w: 630, h: 743 },
  { key: 'monster.vanilla', group: 'Monsters', label: 'Vanilla monster', fallback: '/brand/mascots/vanilla.webp', w: 657, h: 686 },
  { key: 'monster.strawberry', group: 'Monsters', label: 'Strawberry monster', fallback: '/brand/mascots/strawberry.webp', w: 790, h: 799 },
  { key: 'monster.butterscotch', group: 'Monsters', label: 'Butterscotch monster', fallback: '/brand/mascots/butterscotch.webp', w: 646, h: 603 },
  { key: 'monster.chocolate', group: 'Monsters', label: 'Chocolate monster', fallback: '/brand/mascots/chocolate-cheer.webp', w: 824, h: 900 },
  { key: 'monster.mango', group: 'Monsters', label: 'Mango monster', fallback: '/brand/mascots/mango.webp', w: 333, h: 900 },
  { key: 'monster.black-currant', group: 'Monsters', label: 'Black Currant monster', fallback: '/brand/mascots/black-currant.webp', w: 571, h: 688 },

  // Backgrounds & sharing
  { key: 'texture.swirl', group: 'Backgrounds & sharing', label: 'Swirl texture', hint: 'Faint repeating pattern on the yellow and blue bands. Small tile, around 300–400 px wide.', fallback: '/brand/texture-swirl.webp', w: 376, h: 282 },
  { key: 'intro.fill', group: 'Backgrounds & sharing', label: 'Intro animation fill', hint: 'Photo shown inside the giant letters of the opening animation.', fallback: '/hero/intro-fill.jpg', w: 1600, h: 900 },
  { key: 'share.image', group: 'Backgrounds & sharing', label: 'Social share image', hint: 'Preview shown when a link is shared on WhatsApp, Facebook, Messenger, X etc. 1200 × 630. Leave on the built-in images to get a separate one for the homepage, products and partner pages; an upload replaces all three.', fallback: '/og.jpg', w: 1200, h: 630 },
];

export const SLOT_KEYS = new Set(SITE_MEDIA_SLOTS.map((s) => s.key));
export const slotByKey = (key) => SITE_MEDIA_SLOTS.find((s) => s.key === key);
