import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import { getPrivateConfig } from './siteSettings';

// Server-side Cloudinary access (deleting files, connection test). Uploads go
// straight from the browser, signed by /api/upload. The account comes from
// CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET (/ _FOLDER) in .env and
// never reaches the browser.

const configure = async () => {
  const { cloudinary: c } = await getPrivateConfig();
  if (!c.cloudName || !c.apiKey || !c.apiSecret) {
    throw new Error('Cloudinary is not set up: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are missing from the server environment.');
  }
  cloudinary.config({ cloud_name: c.cloudName, api_key: c.apiKey, api_secret: c.apiSecret, secure: true });
  return { client: cloudinary, folder: c.folder };
};

/**
 * Deletes an asset this site uploaded. Ids outside the site's folder are
 * ignored, so a bad value can never remove other files from the account.
 * Failures are logged, not thrown: a leftover file is harmless.
 */
export async function destroyAsset(publicId, resourceType = 'image') {
  if (!publicId) return;
  try {
    const { client, folder } = await configure();
    if (!publicId.startsWith(`${folder}/`)) return;
    await client.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (error) {
    console.error('Cloudinary delete failed', publicId, error?.message);
  }
}

/** Checks the saved account details work (Admin → Site settings → Test). */
export async function pingCloudinary() {
  const { client } = await configure();
  await client.api.ping();
}
