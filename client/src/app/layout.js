import { Inter, Outfit, Lilita_One, Nunito } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import Intro from "../components/Intro";
import ScrollReveal from "../components/ScrollReveal";
import PublicChrome from "../components/PublicChrome";
import { SITE, SEO_KEYWORDS, jsonLd, organizationJsonLd, pageSocial, websiteJsonLd } from "../lib/site";
import { getSiteMedia } from "../lib/siteMedia";
import { getSiteInfo, isSecondaryHost } from "../lib/siteSettings";
import { cldTransform } from "../lib/media";

// The public site uses two faces: Lilita One for headings and Nunito for
// everything else. Inter and Outfit are only used by the admin panel, so they
// are not preloaded; the browser fetches them there on first use.
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", preload: false });

// Site-wide SEO defaults; pages override title, description, canonical and
// share image. Titles stay under ~60 characters and descriptions under ~160
// so Google shows them whole.
const DEFAULT_TITLE = "Blue Mont Dairy | Ice Cream & Kulfi Maker in Nepal";
const SHARE_TITLE = "Blue Mont Dairy: premium ice cream & kulfi for Nepal";

const baseMetadata = {
  title: { default: DEFAULT_TITLE, template: "%s | Blue Mont Dairy" },
  description: SITE.description,
  keywords: SEO_KEYWORDS,
  applicationName: SITE.name,
  category: "food",
  alternates: { canonical: "/" },
  // iOS: "Add to Home Screen" opens full screen, with this name under the icon.
  appleWebApp: { capable: true, title: "Blue Mont", statusBarStyle: "default" },
  // Stops iOS Safari turning prices and numbers into phone links.
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    "geo.region": "NP-BA",
    "geo.placename": "Lalitpur",
    "msapplication-TileColor": "#2D6BB2",
  },
};

const INDEX = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};
const NO_INDEX = { index: false, follow: false, googleBot: { index: false, follow: false } };

// The share image and business details are editable in the admin panel, so
// they are read per request.
export async function generateMetadata() {
  const [media, info] = await Promise.all([getSiteMedia(), getSiteInfo()]);
  const social = pageSocial({ title: SHARE_TITLE, description: SITE.description, path: "/", media });
  const { google, bing } = info.verification;
  return {
    ...baseMetadata,
    metadataBase: new URL(info.siteUrl),
    authors: [{ name: info.legalName, url: info.siteUrl }],
    creator: info.legalName,
    publisher: info.legalName,
    // Copies of the site on other addresses (*.vercel.app) stay out of search.
    robots: (await isSecondaryHost(info.siteUrl)) ? NO_INDEX : INDEX,
    ...((google || bing) && {
      verification: { ...(google && { google }), ...(bing && { other: { "msvalidate.01": bing } }) },
    }),
    other: {
      ...baseMetadata.other,
      "geo.position": `${info.geo.latitude};${info.geo.longitude}`,
      ICBM: `${info.geo.latitude}, ${info.geo.longitude}`,
    },
    ...social,
  };
}

// CSS background images (in the stylesheets as var(--texture-swirl) etc.).
const cssUrl = (img) => (img ? `url("${cldTransform(img.src, "f_auto,q_auto")}")` : "none");

// Colours the browser bar on Android Chrome and iOS Safari, and the accent
// on link previews in Discord and Telegram.
export const viewport = {
  themeColor: "#2D6BB2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const [media, info] = await Promise.all([getSiteMedia(), getSiteInfo()]);

  return (
    // suppressHydrationWarning: the inline script below stamps
    // data-intro-seen on <html> before React hydrates, so the client attribute
    // legitimately differs from the server markup.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Every product photo, mascot and the hero video come from here. */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Runs before first paint so a session that has already seen the
            intro never flashes the overlay. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('bm-intro'))document.documentElement.dataset.introSeen='1'}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${lilita.variable} ${nunito.variable}`}
        style={{ "--texture-swirl": cssUrl(media["texture.swirl"]), "--intro-fill": cssUrl(media["intro.fill"]) }}
      >
        <PublicChrome>
          <Intro />
          <Header logo={media["logo.bluemont"]} mascot={media["home.value-mascot"]} />
        </PublicChrome>
        <main>
          {children}
        </main>
        <PublicChrome>
          <Footer logo={media["logo.bluemont"]} mascot={media["home.value-mascot"]} info={info} />
          {info.whatsapp && <WhatsAppButton number={info.whatsapp} message={info.whatsappMessage} />}
        </PublicChrome>
        <ScrollReveal />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd([organizationJsonLd(media, info), websiteJsonLd(info)]) }}
        />
      </body>
    </html>
  );
}
