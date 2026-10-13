// Turns the built-in monsters (lib/homeContent.js) into Monster records with
// everything on Cloudinary: each picture is uploaded, and each drawn scoop
// is rendered to a PNG and uploaded as the monster's scoop picture, so every
// monster can be edited like one added in the admin panel. Used by
// `npm run seed -- --monsters` and Admin → Monsters → "Start from the
// current monsters".
//
// `cloudinary` is a configured v2 client. `pictureSource(slotKey)` returns
// what to upload for a monster's picture: a file path, or a URL Cloudinary
// can fetch.

import { MONSTERS } from './homeContent.js';
import { scoopSvg } from './scoopShape.js';

export async function builtInMonsterRecords({ cloudinary, folder, pictureSource, updatedBy }) {
  const options = { folder: `${folder}/monsters`, resource_type: 'image', unique_filename: true };
  const scoopFile = (color) => `data:image/svg+xml;base64,${Buffer.from(scoopSvg(color)).toString('base64')}`;

  // Every upload at once: one by one takes minutes, longer than a hosted
  // request may run.
  const results = await Promise.allSettled(
    MONSTERS.flatMap((m) => [
      Promise.resolve(pictureSource(m.image)).then((src) => cloudinary.uploader.upload(src, options)),
      cloudinary.uploader.upload(scoopFile(m.scoop), { ...options, format: 'png' }),
    ])
  );
  const failed = results.find((r) => r.status === 'rejected');
  if (failed) {
    // Don't leave half a set of files behind.
    await Promise.allSettled(
      results.filter((r) => r.status === 'fulfilled').map((r) => cloudinary.uploader.destroy(r.value.public_id, { invalidate: true }))
    );
    throw failed.reason;
  }

  return MONSTERS.map((m, i) => {
    const picture = results[i * 2].value;
    const scoop = results[i * 2 + 1].value;
    return {
      name: m.name,
      flavour: m.flavour,
      image: picture.secure_url,
      imagePublicId: picture.public_id,
      imageWidth: picture.width,
      imageHeight: picture.height,
      tint: m.tint.toUpperCase(),
      scoopColor: m.scoop.toUpperCase(),
      scoopImage: scoop.secure_url,
      scoopImagePublicId: scoop.public_id,
      isActive: true,
      sortOrder: i,
      updatedBy,
    };
  });
}
