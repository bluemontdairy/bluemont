// Uploads a file to Cloudinary and puts it in a site image slot, the same as
// Admin → Site images does. Handy for large files such as the hero video.
//
//   npm run set-site-media -- <slot-key> <file>
//   npm run set-site-media -- hero.video ~/Downloads/hero.mp4
//
// Slot keys are listed in src/lib/siteMediaSlots.js.

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import SiteMedia from '../src/models/SiteMedia.js';
import { slotByKey } from '../src/lib/siteMediaSlots.js';
import { configureCloudinary } from './lib/cloudinary-env.mjs';
import { refreshSite } from './lib/refresh-site.mjs';

const [key, file] = process.argv.slice(2);
const slot = slotByKey(key);
if (!slot || !file) {
  console.error('Usage: npm run set-site-media -- <slot-key> <file>   (keys: src/lib/siteMediaSlots.js)');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env).');
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI);
try {
  const folder = await configureCloudinary(cloudinary);
  const resourceType = slot.kind === 'video' ? 'video' : 'image';
  const res = await cloudinary.uploader.upload(file, {
    folder: `${folder}/site`,
    resource_type: resourceType,
    unique_filename: true,
  });
  console.log(`Uploaded to ${res.secure_url}`);

  const previous = await SiteMedia.findOne({ key }).lean();
  await SiteMedia.findOneAndUpdate(
    { key },
    { url: res.secure_url, publicId: res.public_id, resourceType, width: res.width, height: res.height, updatedBy: 'script' },
    { upsert: true }
  );
  if (previous && previous.publicId !== res.public_id && !(await SiteMedia.exists({ publicId: previous.publicId }))) {
    await cloudinary.uploader.destroy(previous.publicId, { resource_type: previous.resourceType, invalidate: true });
  }
  console.log(`Slot "${slot.label}" now uses the new file.`);
  await refreshSite();
} finally {
  await mongoose.disconnect();
}
