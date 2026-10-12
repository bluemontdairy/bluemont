import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import Carousel from '../components/Carousel';
import HeroVideo from '../components/HeroVideo';
import SiteImage from '../components/SiteImage';
import { BRANDS, MONSTERS, VALUE_PICKS, VALUE_POINTS, buildStats } from '../lib/homeContent';
import { getPublishedReviews } from '../lib/reviews';
import { getSiteInfo } from '../lib/siteSettings';
import { getSiteMedia } from '../lib/siteMedia';
import { getPublicCatalog } from '../lib/catalog';
import { brandLabel, formatMrp } from '../lib/brands';
import { cldTransform, videoPoster } from '../lib/media';

export const metadata = {
  title: { absolute: "Blue Mont Dairy | Ice Cream & Kulfi in Nepal: Top Kulfi, Baeley's, Blissberry" },
  alternates: { canonical: '/' },
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M5 12.5 L10 17 L19 7" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <span className={styles.btnArrow} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// A single ice-cream scoop with a drippy rim, tinted per flavour. The shade
// gradient's id comes from the colour, which is unique per monster.
const SCOOP_SHAPE =
  'M8 32a24 24 0 0 1 48 0c0 1-.1 2-.2 3 1.4 4-1.8 7-4.4 4.6-1.6 5.4-6.6 5-7.4.4-2.2 6.6-8.4 6.6-9.6 0-2 5.2-7.6 5-8.6-.2-1.6 4.2-6.6 3.6-6.8-1.4-3 1.4-5.6-1.6-4.2-4.4C8.1 33.4 8 32.7 8 32z';

function Scoop({ color }) {
  const shade = `scoop-shade-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 64 58" className={styles.scoop} aria-hidden="true">
      <defs>
        <radialGradient id={shade} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <path d={SCOOP_SHAPE} fill={color} />
      <path d={SCOOP_SHAPE} fill={`url(#${shade})`} />
      <path
        d="M14 28c2-1 3 1 5 0M26 22c2-1 3 1 5 0M38 27c2-1 3 1 5 0M20 36c2-1 3 1 5 0M34 35c2-1 3 1 5 0"
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="18" rx="6" ry="3.2" fill="#fff" opacity="0.6" transform="rotate(-28 22 18)" />
    </svg>
  );
}

// Product photo for next/image. Photos uploaded before sizes were stored
// fall back to a tall packshot ratio.
const productImg = (p) => ({ src: p.image, w: p.imageWidth || 600, h: p.imageHeight || 900 });


export default async function Home() {
  const [media, { products }, info, reviews] = await Promise.all([
    getSiteMedia(),
    getPublicCatalog(),
    getSiteInfo(),
    getPublishedReviews(),
  ]);
  const { stats, socials } = info;
  // "@bluemont_dairy" from the Instagram link, for the button label.
  const instagramHandle = socials.instagram ? `@${new URL(socials.instagram).pathname.split('/').filter(Boolean)[0] || 'instagram'}` : '';

  // Hero loop (Admin → Site images → Hero background video). HeroVideo picks
  // a rendition for the screen size; the poster is the uploaded one or the
  // video's first frame.
  const video = media['hero.video'];
  const heroVideo = video?.src || '';
  const heroPoster = media['hero.poster'] ? cldTransform(media['hero.poster'].src, 'f_auto,q_auto,w_1600,c_limit') : videoPoster(video?.src);

  const favourites = products.filter((p) => p.featured);
  const kulfiShelf = products.filter((p) => p.category?.slug === 'kulfi' && p.image);
  const valuePicks = VALUE_PICKS.map((v) => ({ ...v, item: products.find((p) => p.brand === v.brand && p.name === v.product) })).filter(
    (v) => v.item?.image
  );

  return (
    <>
      {/* 1. Hero: what we make, in plain words, over the video loop */}
      <section className={styles.hero}>
        {heroVideo && <HeroVideo src={heroVideo} poster={heroPoster || undefined} />}
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={`${styles.eyebrow} ${styles.eyebrowLight} ${styles.heroEyebrow}`}>
            Blue Mont Dairy · Lalitpur
          </p>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine}>Premium ice cream</span>
            <span className={`${styles.heroLine} ${styles.heroAccent}`}>&amp; kulfi for Nepal</span>
          </h1>
          <p className={styles.heroText}>
            One of Nepal&apos;s leading ice cream and kulfi makers. Top Kulfi, Baeley&apos;s and Blissberry give
            you premium quality at a price that makes sense, every day.
          </p>
          <div className={`${styles.btnRow} ${styles.heroCtas}`}>
            <Link href="/products" className={`${styles.btn} ${styles.btnYellow} ${styles.btnLg}`}>
              Explore products <Arrow />
            </Link>
            <Link href="/#brands" className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}>
              Our brands
            </Link>
          </div>
          <ul className={styles.heroTrust}>
            <li><Check /> {stats.years} years in Lalitpur</li>
            <li><Check /> {stats.districts} districts &amp; cities</li>
            <li><Check /> DFTQC-compliant</li>
          </ul>
        </div>

        <SiteImage
          media={media['hero.mascot-left']}
          aria-hidden="true"
          sizes="(max-width: 640px) 34vw, 240px"
          className={styles.heroMascot}
        />
        <SiteImage
          media={media['hero.kulfi']}
          aria-hidden="true"
          sizes="(max-width: 640px) 20vw, 110px"
          className={styles.heroKulfi}
        />
        <SiteImage
          media={media['hero.mascot-right']}
          aria-hidden="true"
          sizes="(max-width: 640px) 30vw, 220px"
          className={styles.heroMascotRight}
        />
      </section>

      {/* 2. Latest favourites card, overlapping the hero */}
      <section className={styles.favWrap} aria-labelledby="fav-title">
        <div className={styles.favCard} data-reveal>
          <div className={styles.favIntro}>
            <p className={styles.eyebrow}>Fresh in the freezer</p>
            <h2 id="fav-title" className={styles.heading}>Our latest favourites</h2>
            <p>
              Kulfi, Kulfusion and ice cream from Top Kulfi, Baeley&apos;s and Blissberry. Grab one on the way
              home, or make them part of your freezer rotation.
            </p>
            <div className={styles.btnRow}>
              <Link href="/products" className={`${styles.btn} ${styles.btnBlue}`}>
                All products <Arrow />
              </Link>
              <Link href="/partner" className={`${styles.btn} ${styles.btnBlue}`}>
                Stock in store <Arrow />
              </Link>
            </div>
          </div>

          <Carousel label="favourite products" className={styles.favCarousel} trackClassName={styles.favTrack}>
            {favourites.map((p) => {
              const type = p.category?.name || '';
              const img = p.image ? productImg(p) : media['logo.badge'];
              return (
                <li key={p._id} className={styles.favItem}>
                  <div className={styles.favImgWrap}>
                    <span className={styles.favPlate} aria-hidden="true" />
                    {img && (
                      <Image
                        src={img.src}
                        alt={`${brandLabel(p.brand)} ${p.name} ${type.toLowerCase()}`.trim()}
                        width={img.w}
                        height={img.h}
                        sizes="150px"
                        className={styles.favImg}
                      />
                    )}
                  </div>
                  <p className={styles.favTag}>{type}</p>
                  <h3 className={styles.favName}>{p.name}</h3>
                  {typeof p.mrp === 'number' && <p className={styles.favPrice}>{formatMrp(p.mrp)}</p>}
                </li>
              );
            })}
          </Carousel>
        </div>
      </section>

      {/* 3. Value for money */}
      <section id="value" className={styles.moments}>
        <div className={`container ${styles.momentsGrid}`}>
          <div className={styles.valueArt} data-reveal>
            <ul className={styles.valueShelf}>
              {valuePicks.map(({ label, item }) => {
                const img = productImg(item);
                return (
                  <li key={label}>
                    <Image
                      src={img.src}
                      alt={`${brandLabel(item.brand)} ${item.name}`}
                      width={img.w}
                      height={img.h}
                      sizes="140px"
                      className={styles.valueImg}
                    />
                    <span className={styles.valueTag}>
                      {label}
                      <strong>{formatMrp(item.mrp)}</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
            <SiteImage
              media={media['home.value-mascot']}
              aria-hidden="true"
              sizes="110px"
              className={styles.valueMascot}
            />
          </div>

          <div className={styles.momentsText} data-reveal style={{ '--reveal-delay': '120ms' }}>
            <p className={styles.eyebrow}>Value for money</p>
            <h2 className={styles.heading}>Premium taste, honest price</h2>
            <p>
              Good ice cream shouldn&apos;t be a luxury. We make ours with real milk and premium care, then price
              it for Nepal, so a treat is something you have any day, not only on special ones.
            </p>
            <ul className={styles.valueList}>
              {VALUE_POINTS.map((v) => (
                <li key={v}><span className={styles.checkDot}><Check /></span>{v}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3b. Numbers strip */}
      <section className={`container ${styles.stats}`} aria-label="Blue Mont Dairy in numbers">
        <ul className={styles.statsList}>
          {buildStats(stats).map((st, i) => (
            <li key={st.label} data-reveal style={{ '--reveal-delay': `${i * 90}ms` }}>
              <p className={styles.statValue}>
                {st.value}
                {st.unit && <span>{st.unit}</span>}
              </p>
              <p className={styles.statLabel}>{st.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Top Kulfi: where Blue Mont started */}
      <section id="top-kulfi" className={styles.kulfi} aria-labelledby="kulfi-title">
        <div className={`container ${styles.kulfiInner}`}>
          <div className={styles.kulfiText} data-reveal>
            <SiteImage
              media={media['logo.topkulfi']}
              alt="Top Kulfi"
              sizes="220px"
              className={styles.kulfiLogo}
            />
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Where it all started</p>
            <h2 id="kulfi-title" className={styles.kulfiHeading}>The kulfi everybody knows</h2>
            <p>
              Ask anyone about the Rs 10 and Rs 20 kulfi, or the titaura one from the shop down the road. That&apos;s
              Top Kulfi, and it&apos;s where Blue Mont Dairy began. Everything we make today is built on the same
              idea: good milk at a fair price.
            </p>
            <Link href="/products?brand=topkulfi" className={`${styles.btn} ${styles.btnYellow}`}>
              See Top Kulfi <Arrow />
            </Link>
          </div>
          <ul className={styles.kulfiShelf} aria-label="Top Kulfi range">
            {kulfiShelf.map((k, i) => {
              const img = productImg(k);
              // Relative heights (a mini kulfi stands shorter), from the
              // packshot's own size; capped so a large upload isn't huge.
              const scale = Math.min(1, img.h / 900);
              return (
                <li key={k._id} data-reveal style={{ '--reveal-delay': `${i * 60}ms`, '--s': scale }}>
                  <Image
                    src={img.src}
                    alt={`Top Kulfi ${k.name}`}
                    width={img.w}
                    height={img.h}
                    sizes="120px"
                    className={styles.kulfiImg}
                  />
                  <span>{k.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5. All brands. Each entry in BRANDS is a card, so new categories slot in. */}
      <section id="brands" className={styles.brands} aria-labelledby="brands-title">
        <div className="container">
          <div className={styles.brandsHead} data-reveal>
            <p className={styles.eyebrow}>Our family of brands</p>
            <h2 id="brands-title" className={styles.heading}>One dairy, many favourites</h2>
            <p>
              For about {stats.years} years Blue Mont Dairy has made frozen desserts in Lalitpur. Today that means kulfi,
              Kulfusion and ice cream under three brands.
            </p>
          </div>
          <ul className={styles.brandGrid}>
            {BRANDS.map((b, i) => (
              <li key={b.slug} className={styles.brandCard} data-reveal style={{ '--reveal-delay': `${i * 90}ms` }}>
                <div className={styles.brandArt} style={{ background: b.tint }}>
                  <SiteImage
                    media={media[b.image]}
                    alt={b.alt}
                    sizes="140px"
                    className={styles.brandProduct}
                  />
                </div>
                <div className={styles.brandBody}>
                  {media[b.logo] ? (
                    <SiteImage media={media[b.logo]} alt={b.name} sizes="160px" className={styles.brandLogo} />
                  ) : (
                    <p className={styles.brandName}>{b.name}</p>
                  )}
                  <p className={styles.brandCategory}>{b.category}</p>
                  <p className={styles.brandText}>{b.text}</p>
                  <Link href={`/products?brand=${b.slug}`} className={styles.brandLink}>
                    See {b.name} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Quality split */}
      <section id="quality" className={styles.split}>
        <div className={styles.splitArt}>
          <SiteImage
            media={media['home.quality-product']}
            alt="Baeley's ice cream tub box"
            sizes="(max-width: 820px) 40vw, 240px"
            className={styles.splitProduct}
          />
          <SiteImage
            media={media['home.quality-mascot']}
            aria-hidden="true"
            sizes="(max-width: 820px) 34vw, 220px"
            className={styles.splitMascot}
          />
        </div>
        <div className={styles.splitText}>
          <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Quality you can taste</p>
          <h2 className={styles.splitHeading}>
            Proudly made in <span className={styles.splitAccent}>Lalitpur</span>
          </h2>
          <p>
            Every batch of ice cream and kulfi is standardised, hygienically handled and made to DFTQC
            requirements in our own Lalitpur factory, then kept frozen along an unbroken cold chain until it
            reaches your freezer.
          </p>
          <Link href="/products" className={`${styles.btn} ${styles.btnYellow}`}>
            See the range <Arrow />
          </Link>
        </div>
      </section>

      {/* 7. Meet the monsters, each with their scoop */}
      <section className={styles.monsters} aria-labelledby="monsters-title">
        <div className="container">
          <div className={styles.monstersHead}>
            <div data-reveal>
              <p className={styles.eyebrow}>The Baeley&apos;s crew</p>
              <h2 id="monsters-title" className={styles.heading}>Meet the monsters</h2>
              <p>Every Baeley&apos;s ice cream flavour has a monster of its own. Which one are you?</p>
            </div>
            <span className={styles.yum} aria-hidden="true">YUMMM!</span>
          </div>

          <Carousel label="flavour monsters" trackClassName={styles.monsterTrack}>
            {MONSTERS.map((m) => (
              <li key={m.name} className={styles.monsterCard}>
                <div className={styles.monsterImgWrap} style={{ background: m.tint }}>
                  <SiteImage media={media[m.image]} sizes="220px" className={styles.monsterImg} />
                  <Scoop color={m.scoop} />
                </div>
                <div className={styles.monsterLabel}>
                  <h3>{m.name}</h3>
                  <p>{m.flavour}</p>
                </div>
              </li>
            ))}
          </Carousel>

          <div className={styles.center}>
            <Link href="/products?brand=baeleys" className={`${styles.btn} ${styles.btnBlue}`}>
              Find your flavour <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Reviews from Admin → Reviews (left out until one is published) */}
      {reviews.length > 0 && (
        <section className={styles.reviews} aria-labelledby="reviews-title">
          <div className="container">
            <div className={styles.reviewsHead} data-reveal>
              <p className={styles.eyebrow}>What people say</p>
              <h2 id="reviews-title" className={styles.heading}>Loved across Nepal</h2>
            </div>
            <ul className={styles.reviewGrid}>
              {reviews.map((r, i) => (
                <li key={r._id} className={styles.reviewCard} data-reveal style={{ '--reveal-delay': `${i * 90}ms` }}>
                  <span className={styles.reviewMark} aria-hidden="true">“</span>
                  {r.rating && (
                    <p className={styles.reviewStars} aria-label={`${r.rating} out of 5 stars`}>
                      {'★'.repeat(r.rating)}
                      <span aria-hidden="true">{'★'.repeat(5 - r.rating)}</span>
                    </p>
                  )}
                  <blockquote>{r.quote}</blockquote>
                  <div className={styles.reviewWho}>
                    {r.photo && (
                      <Image
                        src={cldTransform(r.photo, 'c_fill,g_face,w_96,h_96')}
                        alt=""
                        width={48}
                        height={48}
                        className={styles.reviewPhoto}
                      />
                    )}
                    <p>
                      <strong>{r.name}</strong>
                      {r.place && <span>{r.place}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 9. Latest scoop: follow along (only when a social link is set) */}
      {Object.values(socials).some(Boolean) && (
        <section className={styles.scoopBand} aria-labelledby="scoop-title">
          <div className={`container ${styles.scoopInner}`} data-reveal>
            <SiteImage media={media['logo.bluemont']} sizes="96px" className={styles.scoopBadge} />
            <div className={styles.scoopText}>
              <h2 id="scoop-title" className={styles.heading}>Get the latest scoop</h2>
              <p>New flavours, freezer drops and monster sightings land on our socials first.</p>
            </div>
            <div className={styles.scoopActions}>
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnBlue}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
                  {instagramHandle}
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className={styles.scoopIcon} aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" /></svg>
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className={styles.scoopIcon} aria-label="TikTok">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.6-2.6 6.1-6 6.1a6 6 0 0 1-6-6c0-3.6 3-6.2 6.7-5.9v3.2c-1.7-.3-3.4.9-3.4 2.7 0 1.6 1.2 2.8 2.7 2.8 1.6 0 2.8-1.1 2.8-3V3h3.2z" /></svg>
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className={styles.scoopIcon} aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
                </a>
              )}
            </div>
            <SiteImage
              media={media['home.scoop-mascot']}
              aria-hidden="true"
              sizes="130px"
              className={styles.scoopMascot}
            />
          </div>
        </section>
      )}

      {/* 10. Short pointer for shops; the full pitch lives on /partner */}
      <section className={styles.partner} aria-labelledby="partner-title">
        <div className={`container ${styles.partnerInner}`}>
          <div className={styles.partnerText} data-reveal>
            <p className={styles.eyebrow}>For shops, cafés &amp; canteens</p>
            <h2 id="partner-title" className={styles.heading}>Want us in your place?</h2>
            <p>
              Join the shops across {stats.districts} districts and cities that keep Top Kulfi, Baeley&apos;s and Blissberry in
              their freezers. We&apos;d love to have you in the Blue Mont family.
            </p>
            <Link href="/partner" className={`${styles.btn} ${styles.btnYellow}`}>
              Become a partner <Arrow />
            </Link>
          </div>
          <SiteImage
            media={media['home.partner-mascot']}
            aria-hidden="true"
            sizes="(max-width: 820px) 50vw, 280px"
            className={styles.partnerMascot}
          />
        </div>
      </section>
    </>
  );
}
