import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';
import connectDB from '../../../../lib/db';
import SiteSettings from '../../../../models/SiteSettings';
import { resolveSettings, SECRET_KEYS, SETTINGS_KEYS } from '../../../../lib/settingsSchema';
import SettingsManager from '../../../../components/admin/SettingsManager';
import { getPrivateConfig } from '../../../../lib/siteSettings';

export const metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  if (!can(await getCurrentAdmin(), 'settings.manage')) redirect('/admin');
  await connectDB();
  // Read straight from the database (not the site cache) so the form always
  // shows the latest saved values.
  const doc = await SiteSettings.findById('site').lean();
  const values = doc?.values || {};
  // Secret values stay on the server; the form only learns which are saved.
  const stored = Object.fromEntries(Object.entries(values).filter(([k]) => SETTINGS_KEYS.has(k) && !SECRET_KEYS.has(k)));
  const secretsSet = Object.fromEntries([...SECRET_KEYS].map((k) => [k, Boolean(values[k])]));
  // Only whether each connection is configured, never the credentials.
  const { smtp, cloudinary } = await getPrivateConfig();
  const connections = {
    email: Boolean(smtp.host && smtp.user && smtp.pass),
    cloudinary: Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret),
  };
  return (
    <SettingsManager
      stored={stored}
      secretsSet={secretsSet}
      connections={connections}
      defaults={resolveSettings({})}
      updatedBy={doc?.updatedBy || ''}
      updatedAt={doc?.updatedAt ? doc.updatedAt.toISOString() : null}
    />
  );
}
