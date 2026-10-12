import connectDB from '../../../../lib/db';
import Lead from '../../../../models/Lead';
import LeadsManager from '../../../../components/admin/LeadsManager';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';

export const metadata = { title: 'Partner leads' };

export default async function AdminLeadsPage() {
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  const plain = leads.map((l) => ({
    ...l,
    _id: String(l._id),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));
  return <LeadsManager initialLeads={plain} canDelete={can(await getCurrentAdmin(), 'leads.delete')} />;
}
