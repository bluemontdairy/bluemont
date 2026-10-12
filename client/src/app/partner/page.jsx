import PartnerForm from './PartnerForm';
import PageHero from '../../components/PageHero';
import styles from './page.module.css';
import { jsonLd, pageSocial } from '../../lib/site';
import { getSiteMedia } from '../../lib/siteMedia';
import { getSiteInfo } from '../../lib/siteSettings';
import { breadcrumbJsonLd } from '../../lib/catalogJsonLd';

export const generateMetadata = async () => ({
  title: 'Stock Blue Mont Ice Cream in Your Shop',
  description:
    "Stock Top Kulfi, Baeley's and Blissberry in your shop, kirana, café or canteen. Branded freezers for qualifying partners, cold-chain restocks and POS support.",
  alternates: { canonical: '/partner' },
  ...pageSocial({
    title: 'Stock Blue Mont ice cream & kulfi in your shop',
    description: 'Branded freezers, a range customers already ask for, and scheduled cold-chain restocks for Blue Mont retail partners.',
    path: '/partner',
    media: await getSiteMedia(),
    image: 'partner',
  }),
});

// Section 5.1 of the scope document.
const VALUE_POINTS = [
  {
    title: 'A range people ask for',
    text: 'Top Kulfi, Baeley\'s and Blissberry: the kulfi everybody knows, everyday ice cream treats, family packs and catering tubs.',
    icon: 'M3 17l6-6 4 4 8-8M14 7h7v7',
  },
  {
    title: 'Freezer placement program',
    text: 'Dedicated branded deep freezers for qualifying partners, based on location footfall and sales capacity.',
    icon: 'M4 3h16v18H4zM4 9h16M8 6h.01M8 13v4',
  },
  {
    title: 'Unbroken cold-chain supply',
    text: 'Regular scheduled restock runs across Lalitpur, Kathmandu and Bhaktapur, so stock arrives frozen hard.',
    icon: 'M1 5h14v11H1zM15 9h4l4 4v3h-8zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  },
  {
    title: 'Branding & POS support',
    text: 'Outdoor flex banners, menu boards, freezer stickers and promotional posters for your counter.',
    icon: 'M3 11l15-6v14L3 13zM7 12.5V19h4v-5',
  },
];

export default async function PartnerPage() {
  const [media, info] = await Promise.all([getSiteMedia(), getSiteInfo()]);
  return (
    <div className={styles.page}>
      <PageHero eyebrow="For shops, cafés & canteens" title="Want us in your place?" mascot={media['home.partner-mascot']}>
        <p>
          Departmental stores, kirana marts, cafés, bakeries and school canteens: join the Blue Mont family.
          We look after our partners with branded freezers, reliable restocks and everything your counter needs.
        </p>
      </PageHero>

      <div className={`container ${styles.content}`}>
        <section className={styles.benefitsSection} aria-labelledby="why-partner">
          <h2 id="why-partner" className={styles.sectionTitle}>Why partner with us?</h2>
          <div className={styles.benefitsGrid}>
            {VALUE_POINTS.map((point) => (
              <div key={point.title} className={styles.benefitCard}>
                <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d={point.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.formSection} aria-labelledby="partner-form-title">
          <PartnerForm />
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd([['Home', '/'], ['Become a partner', '/partner']], info.siteUrl)) }}
      />
    </div>
  );
}
