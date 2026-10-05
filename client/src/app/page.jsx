import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import Carousel from '../components/Carousel';
import HeroVideo from '../components/HeroVideo';
import { FAVORITES, MONSTERS, PARTNER_POINTS, STATS, QUALITY_POINTS, whatsappUrl } from '../lib/homeContent';

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

// Drop a 16:9 loop (H.264 MP4, muted, ideally under ~4 MB) at this path and the
// hero plays it under the blue gradient; until then the gradient stands alone.
const HERO_VIDEO = '/hero/hero-loop.mp4';
const HERO_POSTER = '/hero/hero-poster.webp';

const publicFileExists = (p) => fs.existsSync(path.join(process.cwd(), 'public', p));

export default function Home() {
  const hasVideo = publicFileExists(HERO_VIDEO);
  const hasPoster = publicFileExists(HERO_POSTER);

  return (
    <>
      {/* 1. Hero: 16:9 video loop under a blue gradient */}
      <section className={styles.hero}>
        {hasVideo && <HeroVideo src={HERO_VIDEO} poster={hasPoster ? HERO_POSTER : undefined} />}
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={`${styles.eyebrow} ${styles.eyebrowLight} ${styles.heroEyebrow}`}>
            Churned fresh in Lalitpur
          </p>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine}>Freeze the moment with</span>
            <Image
              src="/brand/logo/wordmark.webp"
              alt="Baeley's"
              width={960}
              height={440}
              sizes="(max-width: 640px) 70vw, 380px"
              className={styles.heroWordmark}
              preload
            />
          </h1>
          <p className={styles.heroText}>
            Twenty years of Lalitpur dairy, churned into monster-sized treats. Real moments happen when we take
            the time to treat ourselves.
          </p>
          <div className={`${styles.btnRow} ${styles.heroCtas}`}>
            <Link href="/products" className={`${styles.btn} ${styles.btnYellow} ${styles.btnLg}`}>
              Explore treats <Arrow />
            </Link>
            <Link href="/partner" className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}>
              Stock us in your store
            </Link>
          </div>
          <ul className={styles.heroTrust}>
            <li><Check /> 20 years of dairy</li>
            <li><Check /> DFTQC-compliant</li>
            <li><Check /> Treats from Rs 20</li>
          </ul>
        </div>

        <Image
          src="/brand/mascots/yeti-cone.webp"
          alt=""
          aria-hidden="true"
          width={717}
          height={900}
          sizes="(max-width: 640px) 34vw, 240px"
          className={styles.heroMascot}
        />
        <Image
          src="/brand/mascots/butterscotch.webp"
          alt=""
          aria-hidden="true"
          width={646}
          height={603}
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
              The newest from Baeley&apos;s and Blissberry. Grab one on the way home, or make them part of your
              freezer rotation.
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
            {FAVORITES.map((p) => (
              <li key={p.name} className={styles.favItem}>
                <div className={styles.favImgWrap}>
                  <span className={styles.favPlate} aria-hidden="true" />
                  <Image src={p.image} alt="" width={p.w} height={p.h} sizes="150px" className={styles.favImg} />
                </div>
                <p className={styles.favTag}>{p.tag}</p>
                <h3 className={styles.favName}>{p.name}</h3>
                <p className={styles.favPrice}>{p.price}</p>
              </li>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 3. Real moments */}
      <section className={styles.moments}>
        <div className={`container ${styles.momentsGrid}`}>
          <div className={styles.momentsArt} data-reveal>
            <div className={`${styles.tile} ${styles.tileYellow}`}>
              <Image
                src="/brand/products/sundae-strawberry.webp"
                alt="Baeley's Super Sundae, strawberry"
                width={486}
                height={900}
                sizes="120px"
                className={styles.tileProduct}
              />
              <Image
                src="/brand/products/cone-chocolate.webp"
                alt="Baeley's chocolate Monstro Cone"
                width={340}
                height={888}
                sizes="90px"
                className={styles.tileProductSmall}
              />
            </div>
            <div className={`${styles.tile} ${styles.tileBlue}`}>
              <Image
                src="/brand/mascots/group-scene.webp"
                alt="The Baeley's monsters piled up around a heap of ice cream"
                width={1086}
                height={900}
                sizes="(max-width: 640px) 60vw, 300px"
                className={styles.tileScene}
              />
            </div>
            <Image
              src="/brand/mascots/yeti-wave.webp"
              alt=""
              aria-hidden="true"
              width={840}
              height={900}
              sizes="140px"
              className={styles.momentsMascot}
            />
          </div>

          <div className={styles.momentsText} data-reveal style={{ '--reveal-delay': '120ms' }}>
            <p className={styles.eyebrow}>Made for sharing</p>
            <h2 className={styles.heading}>Here for the real moments</h2>
            <p>
              The best memories aren&apos;t planned. They happen after school, on a hot Kathmandu afternoon, or
              when the whole family crowds round one tub.
            </p>
            <p>
              Baeley&apos;s is built for those moments: big flavours, a monster on every pack, and a price that
              starts at Rs 20.
            </p>
          </div>
        </div>
      </section>

      {/* 3b. Numbers strip */}
      <section className={styles.stats} aria-label="Blue Mont Dairy in numbers">
        <ul className={`container ${styles.statsList}`}>
          {STATS.map((st, i) => (
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

      {/* 4. Quality split */}
      <section id="quality" className={styles.split}>
        <div className={styles.splitArt}>
          <Image
            src="/brand/products/tub-box.webp"
            alt="Baeley's tub box"
            width={708}
            height={900}
            sizes="(max-width: 820px) 40vw, 240px"
            className={styles.splitProduct}
          />
          <Image
            src="/brand/mascots/chocolate-cheer.webp"
            alt=""
            aria-hidden="true"
            width={824}
            height={900}
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
            Every batch is standardised, hygienically handled and made to DFTQC requirements in our own
            Lalitpur factory, then kept frozen along an unbroken cold chain until it reaches your freezer.
          </p>
          <ul className={styles.checkList}>
            {QUALITY_POINTS.map((q) => (
              <li key={q}><span className={styles.checkDot}><Check /></span>{q}</li>
            ))}
          </ul>
          <Link href="/products" className={`${styles.btn} ${styles.btnYellow}`}>
            See the range <Arrow />
          </Link>
        </div>
      </section>

      {/* 5. Our story */}
      <section id="story" className={styles.story}>
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.storyText} data-reveal>
            <p className={styles.eyebrow}>Since day one</p>
            <h2 className={styles.heading}>Our story</h2>
            <p>
              For about 20 years Blue Mont Dairy has been making frozen desserts for the Kathmandu Valley. Today
              that heritage lives in three brands: playful <strong>Baeley&apos;s</strong>, the{' '}
              <strong>Blissberry</strong> Kulfusion line that blends traditional kulfi with modern flavours, and{' '}
              <strong>Top Kulfi</strong>, our classic Khuwa kulfi and fruit popsicles.
            </p>
            <Link href="/products" className={`${styles.btn} ${styles.btnBlue}`}>
              Meet the brands <Arrow />
            </Link>
          </div>
          <div className={styles.storyOval} data-reveal style={{ '--reveal-delay': '120ms' }}>
            <Image
              src="/brand/products/family-pack-1000ml.webp"
              alt="Baeley's 1000 ml family pack"
              width={729}
              height={833}
              sizes="(max-width: 820px) 50vw, 240px"
              className={styles.storyProduct}
            />
            <Image
              src="/brand/products/blissberry-blueberry.webp"
              alt="Blissberry Kulfusion blueberry stick"
              width={347}
              height={900}
              sizes="90px"
              className={styles.storyStick}
            />
          </div>
        </div>
      </section>

      {/* 6. Meet the monsters */}
      <section className={styles.monsters} aria-labelledby="monsters-title">
        <div className="container">
          <div className={styles.monstersHead}>
            <div data-reveal>
              <p className={styles.eyebrow}>The Baeley&apos;s crew</p>
              <h2 id="monsters-title" className={styles.heading}>Meet the monsters</h2>
              <p>Every Baeley&apos;s flavour has a monster of its own. Which one are you?</p>
            </div>
            <span className={styles.yum} aria-hidden="true">YUMMM!</span>
          </div>

          <Carousel label="flavour monsters" trackClassName={styles.monsterTrack}>
            {MONSTERS.map((m) => (
              <li key={m.name} className={styles.monsterCard}>
                <div className={styles.monsterImgWrap} style={{ background: m.tint }}>
                  <Image src={m.image} alt="" width={m.w} height={m.h} sizes="220px" className={styles.monsterImg} />
                </div>
                <div className={styles.monsterLabel}>
                  <h3>{m.name}</h3>
                  <p>{m.flavour}</p>
                </div>
              </li>
            ))}
          </Carousel>

          <div className={styles.center}>
            <Link href="/products" className={`${styles.btn} ${styles.btnBlue}`}>
              Find your flavour <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Latest scoop: follow along */}
      <section className={styles.scoop} aria-labelledby="scoop-title">
        <div className={`container ${styles.scoopInner}`} data-reveal>
          <Image src="/brand/logo/badge.webp" alt="" width={600} height={600} sizes="96px" className={styles.scoopBadge} />
          <div className={styles.scoopText}>
            <h2 id="scoop-title" className={styles.heading}>Get the latest scoop</h2>
            <p>New flavours, freezer drops and monster sightings land on our socials first.</p>
          </div>
          <div className={styles.scoopActions}>
            <a href="https://instagram.com/bluemont_dairy" target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnBlue}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
              @bluemont_dairy
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.scoopIcon} aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" /></svg>
            </a>
          </div>
          <Image
            src="/brand/mascots/strawberry.webp"
            alt=""
            aria-hidden="true"
            width={790}
            height={799}
            sizes="130px"
            className={styles.scoopMascot}
          />
        </div>
      </section>

      {/* 8. B2B partner band */}
      <section className={styles.partner} aria-labelledby="partner-title">
        <div className={`container ${styles.partnerInner}`}>
          <div className={styles.partnerText} data-reveal>
            <p className={styles.eyebrow}>For retailers</p>
            <h2 id="partner-title" className={styles.heading}>Want us in your place?</h2>
            <p>
              Marts, kiranas, cafés, bakeries and school canteens across the valley stock Baeley&apos;s. Qualifying
              partners get a branded deep freezer.
            </p>
            <ul className={styles.partnerPoints}>
              {PARTNER_POINTS.map((pt) => (
                <li key={pt.title}>
                  <strong>{pt.title}</strong>
                  <span>{pt.text}</span>
                </li>
              ))}
            </ul>
            <div className={styles.btnRow}>
              <Link href="/partner" className={`${styles.btn} ${styles.btnYellow}`}>
                Apply for a freezer <Arrow />
              </Link>
              <a
                href={whatsappUrl("Hi Blue Mont, I would like to stock Baeley's in my store.")}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnBlue}`}
              >
                WhatsApp sales <Arrow />
              </a>
            </div>
          </div>
          <Image
            src="/brand/mascots/yeti-jump.webp"
            alt=""
            aria-hidden="true"
            width={941}
            height={900}
            sizes="(max-width: 820px) 50vw, 280px"
            className={styles.partnerMascot}
          />
        </div>
      </section>
    </>
  );
}
