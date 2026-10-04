import connectDB from '../../../../lib/db';
import Lead from '../../../../models/Lead';
import LeadsManager from '../../../../components/admin/LeadsManager';

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
  return <LeadsManager initialLeads={plain} />;
}
