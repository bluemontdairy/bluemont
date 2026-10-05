import { Inter, Outfit, Playfair_Display, Lilita_One, Nunito } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import Intro from "../components/Intro";
import ScrollReveal from "../components/ScrollReveal";
import PublicChrome from "../components/PublicChrome";
import { SITE, SITE_URL, SEO_KEYWORDS, jsonLd, organizationJsonLd } from "../lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
// Chunky rounded display face for headings; Nunito for body copy on the new pages.
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

// Site-wide SEO defaults; pages override title/description/canonical.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blue Mont Dairy | Ice Cream & Kulfi in Nepal: Top Kulfi, Baeley's, Blissberry",
    template: "%s | Blue Mont Dairy",
  },
  description: "Blue Mont Dairy is one of Nepal's leading ice cream and kulfi makers: Top Kulfi, Baeley's ice cream and Blissberry Kulfusion, made in Lalitpur for 20 years and sold in 12+ districts and cities. Premium quality at an honest price.",
  keywords: SEO_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "food",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: SITE.name,
    url: "/",
    title: "Blue Mont Dairy: ice cream & kulfi from Nepal",
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Ice cream and kulfi by Blue Mont Dairy, Lalitpur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Mont Dairy: ice cream & kulfi from Nepal",
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  other: {
    "geo.region": "NP-BA",
    "geo.placename": "Lalitpur",
    "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
    ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
  },
};

export const viewport = {
  themeColor: "#2D6BB2",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script below stamps
    // data-intro-seen on <html> before React hydrates, so the client attribute
    // legitimately differs from the server markup.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so a session that has already seen the
            intro never flashes the overlay. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('bm-intro'))document.documentElement.dataset.introSeen='1'}catch(e){}",
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${lilita.variable} ${nunito.variable}`}>
        <PublicChrome>
          <Intro />
          <Header />
        </PublicChrome>
        <main>
          {children}
        </main>
        <PublicChrome>
          <Footer />
          <WhatsAppButton />
        </PublicChrome>
        <ScrollReveal />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
