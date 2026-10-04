import { NextResponse } from 'next/server';
import sharp from 'sharp';
import connectDB from '../../../lib/db';
import Media from '../../../models/Media';
import { protect } from '../../../lib/auth';
import { handleError, unauthorized } from '../../../lib/apiResponse';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

// Takes a packshot from the admin panel, converts it to .webp (keeping
// transparency) at most 900px tall, and stores it in MongoDB.
export async function POST(request) {
  try {
    if (!(await protect(request))) return unauthorized();

    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'Choose an image to upload.' }, { status: 400 });
    }
    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json({ message: 'Use a PNG, JPG, WebP or AVIF image.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: 'Image is larger than 8 MB.' }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ height: 900, width: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90 })
      .toBuffer({ resolveWithObject: true });

    await connectDB();
    const media = await Media.create({
      filename: file.name.replace(/\.[^.]+$/, '') + '.webp',
      contentType: 'image/webp',
      size: data.length,
      width: info.width,
      height: info.height,
      data,
    });

    return NextResponse.json({ url: `/media/${media._id}`, width: info.width, height: info.height }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
