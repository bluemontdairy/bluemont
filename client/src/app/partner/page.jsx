import PartnerForm from './PartnerForm';
import styles from './page.module.css';
import { pageSocial } from '../../lib/site';

export const metadata = {
  title: 'Stock Our Ice Cream — Free Branded Deep Freezer for Shops',
  description:
    "Stock Top Kulfi, Baeley's ice cream and Blissberry Kulfusion in your shop, kirana, cafe, bakery or canteen. Branded deep freezer placement, scheduled cold-chain restocking and POS support from Blue Mont Dairy.",
  alternates: { canonical: '/partner' },
  ...pageSocial({
    title: 'Want Blue Mont ice cream in your place?',
    description: 'Branded deep freezers, a range customers already ask for, and scheduled cold-chain restock for Blue Mont retail partners.',
    path: '/partner',
  }),
};

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

export default function PartnerPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Want Us in Your Place?</h1>
          <p className={styles.subtitle}>
            Departmental stores, kirana marts, cafes, bakeries and school canteens: join the Blue Mont family.
            We look after our partners with branded freezers, reliable restocks and everything your counter needs.
          </p>
        </div>
      </header>

      <div className={`container ${styles.content}`}>
        <section className={styles.benefitsSection} aria-labelledby="why-partner">
          <h2 id="why-partner" className={styles.sectionTitle}>Why partner with us?</h2>
          <div className={styles.benefitsGrid}>
            {VALUE_POINTS.map((point) => (
              <div key={point.title} className={styles.benefitCard}>
                <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d={point.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.formSection} aria-labelledby="partner-form-title">
          <PartnerForm />
        </section>
      </div>
    </div>
  );
}
