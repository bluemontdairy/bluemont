import { getCurrentAdmin } from '../../../../lib/auth';
import AccountManager from '../../../../components/admin/AccountManager';

export const metadata = { title: 'Account & security' };

export default async function AccountPage() {
  const admin = await getCurrentAdmin();
  return (
    <AccountManager
      admin={{
        username: admin.username,
        email: admin.email,
        totpEnabled: admin.totpEnabled,
        lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString() : null,
        passwordChangedAt: admin.passwordChangedAt ? new Date(admin.passwordChangedAt).toISOString() : null,
      }}
    />
  );
}
