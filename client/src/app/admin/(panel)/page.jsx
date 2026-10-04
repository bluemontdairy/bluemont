import Link from 'next/link';
import connectDB from '../../../lib/db';
import Lead from '../../../models/Lead';
import Product from '../../../models/Product';
import Contact from '../../../models/Contact';
import s from '../../../components/admin/admin.module.css';

export const metadata = { title: 'Overview' };

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' });

async function getOverview() {
  await connectDB();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    Lead.countDocuments({ partnershipNeed: 'Need a Company Deep Freezer', status: { $in: ['new', 'contacted'] } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: false }),
    Contact.countDocuments({ isRead: false }),
    Lead.countDocuments({ sheetSynced: false }),
    Lead.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);
}

export default async function AdminOverview() {
  const [newLeads, leadsThisWeek, freezerRequests, liveProducts, hiddenProducts, unread, unsynced, recent] = await getOverview();

  const stats = [
    { label: 'New partner leads', value: newLeads, hint: `${leadsThisWeek} in the last 7 days`, href: '/admin/leads' },
    { label: 'Open freezer requests', value: freezerRequests, hint: 'New or contacted', href: '/admin/leads' },
    { label: 'Products live', value: liveProducts, hint: hiddenProducts ? `${hiddenProducts} hidden` : 'All visible', href: '/admin/products' },
    { label: 'Unread messages', value: unread, hint: 'From the contact form', href: '/admin/messages' },
  ];

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Overview</h1>
          <p className={s.pageSub}>What needs attention today.</p>
        </div>
      </div>

      {unsynced > 0 && (
        <div className={s.alertError}>
          {unsynced} lead{unsynced === 1 ? ' was' : 's were'} not copied to the Google Sheet. Open{' '}
          <Link href="/admin/leads" style={{ textDecoration: 'underline' }}>Partner leads</Link> to retry.
        </div>
      )}

      <div className={s.statGrid}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={s.stat}>
            <span className={s.statLabel}>{stat.label}</span>
            <span className={s.statValue}>{stat.value}</span>
            <span className={s.statHint}>{stat.hint}</span>
          </Link>
        ))}
      </div>

      <h2 className={s.sectionTitle}>Latest partner leads</h2>
      <div className={s.tableWrap}>
        {recent.length === 0 ? (
          <p className={s.empty}>No leads yet. They appear here when a shop submits the &ldquo;Want us in your place?&rdquo; form.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Location</th>
                <th>Needs</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((lead) => (
                <tr key={String(lead._id)}>
                  <td>
                    <div className={s.cellStrong}>{lead.businessName}</div>
                    <div className={s.cellSub}>{lead.businessType}</div>
                  </td>
                  <td>{lead.location}</td>
                  <td className={s.cellSub}>{lead.partnershipNeed.join(', ')}</td>
                  <td className={s.cellSub}>{dateFmt.format(lead.createdAt)}</td>
                  <td><span className={s[`badge_${lead.status}`]}>{lead.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
