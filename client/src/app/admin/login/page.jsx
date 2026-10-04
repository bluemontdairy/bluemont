import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../lib/auth';
import LoginForm from '../../../components/admin/LoginForm';

export const metadata = { title: 'Sign in' };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect('/admin');
  return <LoginForm />;
}
