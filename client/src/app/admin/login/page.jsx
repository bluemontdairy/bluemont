import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../lib/auth';
import { getSiteMedia } from '../../../lib/siteMedia';
import LoginForm from '../../../components/admin/LoginForm';

export const metadata = { title: 'Sign in' };

const NOTICES = {
  reset: 'Your password was changed. Sign in with the new one.',
  expired: 'You were signed out. Please sign in again.',
};

export default async function AdminLoginPage({ searchParams }) {
  if (await getCurrentAdmin()) redirect('/admin');
  const { notice } = await searchParams;
  const media = await getSiteMedia();
  return <LoginForm logo={media['logo.badge']?.src} notice={NOTICES[notice] || ''} />;
}
