import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../lib/auth';
import connectDB from '../../../lib/db';
import Lead from '../../../models/Lead';
import Contact from '../../../models/Contact';
import AdminNav from '../../../components/admin/AdminNav';
import s from '../../../components/admin/admin.module.css';

// Every page in this group requires a signed-in admin. The API routes check
// the session again on their own, so this guard is for the UI only.
export default async function PanelLayout({ children }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  await connectDB();
  const [newLeads, unreadMessages] = await Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Contact.countDocuments({ isRead: false }),
  ]);

  return (
    <div className={s.shell}>
      <AdminNav admin={{ username: admin.username, email: admin.email }} counts={{ newLeads, unreadMessages }} />
      <div className={s.main}>{children}</div>
    </div>
  );
}
