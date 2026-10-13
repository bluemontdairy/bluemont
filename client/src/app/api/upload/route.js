import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { authorize } from '../../../lib/auth';
import { getPrivateConfig } from '../../../lib/siteSettings';
import { can } from '../../../lib/roles';
import { denied, forbidden, handleError } from '../../../lib/apiResponse';

// Signs a direct browser → Cloudinary upload. Files never pass through this
// server, so there is no request size limit to hit (Vercel caps request
// bodies at ~4.5 MB) and big videos upload fine.
//
// The signature pins the folder, the allowed formats and, for images, an
// incoming resize to at most 2400 px, so a signed request can't be reused to
// put anything else in the account. Signatures expire after an hour.

const FOLDERS = { product: 'products', category: 'categories', site: 'site', review: 'reviews', monster: 'monsters' };
const PERMISSION = { product: 'products.edit', category: 'categories.manage', site: 'siteMedia.manage', review: 'reviews.edit', monster: 'monsters.edit' };
const FORMATS = { image: 'jpg,jpeg,png,webp,avif', video: 'mp4,webm,mov' };

export async function POST(request) {
  try {
    const auth = await authorize(request);
    if (!auth.admin) return denied(auth);

    const body = await request.json().catch(() => ({}));
    const purpose = FOLDERS[body.purpose] ? body.purpose : 'product';
    if (!can(auth.admin, PERMISSION[purpose])) return forbidden();
    const kind = body.kind === 'video' ? 'video' : 'image';
    if (kind === 'video' && purpose !== 'site') {
      return NextResponse.json({ message: 'Videos can only be used as site media.' }, { status: 400 });
    }

    const { cloudinary: c } = await getPrivateConfig();
    if (!c.cloudName || !c.apiKey || !c.apiSecret) {
      return NextResponse.json({ message: 'Cloudinary is not set up on the server (CLOUDINARY_* in .env).' }, { status: 400 });
    }

    const params = {
      folder: `${c.folder}/${FOLDERS[purpose]}`,
      timestamp: Math.round(Date.now() / 1000),
      allowed_formats: FORMATS[kind],
      ...(kind === 'image' && { transformation: 'c_limit,w_2400,h_2400' }),
    };
    const signature = cloudinary.utils.api_sign_request(params, c.apiSecret);

    return NextResponse.json({
      uploadUrl: `https://api.cloudinary.com/v1_1/${c.cloudName}/${kind}/upload`,
      fields: { ...params, api_key: c.apiKey, signature },
    });
  } catch (error) {
    return handleError(error);
  }
}
