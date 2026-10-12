import connectDB from '../../../../lib/db';
import SiteMedia from '../../../../models/SiteMedia';
import SiteMediaManager from '../../../../components/admin/SiteMediaManager';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';

export const metadata = { title: 'Site images' };

export default async function SiteMediaPage() {
  if (!can(await getCurrentAdmin(), 'siteMedia.manage')) redirect('/admin');
  await connectDB();
  const docs = await SiteMedia.find().lean();
  const uploads = docs.map((d) => ({
    key: d.key,
    url: d.url,
    resourceType: d.resourceType,
    width: d.width || null,
    height: d.height || null,
    updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
    updatedBy: d.updatedBy || '',
  }));
  return <SiteMediaManager initialUploads={uploads} />;
}
