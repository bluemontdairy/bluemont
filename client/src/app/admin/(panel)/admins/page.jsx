import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';
import connectDB from '../../../../lib/db';
import { listAdmins } from '../../../../lib/adminAccounts';
import AdminsManager from '../../../../components/admin/AdminsManager';

export const metadata = { title: 'Admins' };

export default async function AdminsPage() {
  const me = await getCurrentAdmin();
  if (!can(me, 'admins.manage')) redirect('/admin');
  await connectDB();
  return <AdminsManager initialAdmins={await listAdmins()} meId={me._id} />;
}
