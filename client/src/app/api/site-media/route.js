import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '../../../lib/db';
import SiteMedia from '../../../models/SiteMedia';
import { authorize } from '../../../lib/auth';
import { destroyAsset } from '../../../lib/cloudinary';
import { isCloudinaryUrl } from '../../../lib/media';
import { slotByKey } from '../../../lib/siteMediaSlots';
import { SITE_MEDIA_TAG } from '../../../lib/siteMedia';
import { denied, handleError } from '../../../lib/apiResponse';

const refresh = () => {
  revalidateTag(SITE_MEDIA_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
};

// The seed can point two slots at one file, so a file is only deleted from
// Cloudinary once no slot uses it.
async function releaseAsset(doc) {
  if (await SiteMedia.exists({ publicId: doc.publicId })) return;
  await destroyAsset(doc.publicId, doc.resourceType);
}

// Uploaded files for every slot, for the admin page.
export async function GET(request) {
  try {
    const auth = await authorize(request, 'siteMedia.manage');
    if (!auth.admin) return denied(auth);
    await connectDB();
    const docs = await SiteMedia.find().lean();
    return NextResponse.json(docs.map((d) => ({ key: d.key, url: d.url, resourceType: d.resourceType, width: d.width, height: d.height, updatedAt: d.updatedAt, updatedBy: d.updatedBy })));
  } catch (error) {
    return handleError(error);
  }
}

// Point a slot at a file that /api/upload just put on Cloudinary. The file
// it replaces is deleted from Cloudinary.
export async function PUT(request) {
  try {
    const auth = await authorize(request, 'siteMedia.manage');
    if (!auth.admin) return denied(auth);
    const { admin } = auth;

    const body = await request.json().catch(() => ({}));
    const slot = slotByKey(body.key);
    if (!slot) return NextResponse.json({ message: 'Unknown image slot.' }, { status: 400 });

    const kind = slot.kind || 'image';
    if (!isCloudinaryUrl(body.url) || body.resourceType !== kind || typeof body.publicId !== 'string') {
      return NextResponse.json({ message: kind === 'video' ? 'Upload a video for this slot.' : 'Upload an image for this slot.' }, { status: 400 });
    }

    await connectDB();
    const previous = await SiteMedia.findOne({ key: slot.key }).lean();
    const dim = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : null);
    const saved = await SiteMedia.findOneAndUpdate(
      { key: slot.key },
      { url: body.url, publicId: body.publicId.slice(0, 300), resourceType: kind, width: dim(body.width), height: dim(body.height), updatedBy: admin.username },
      { upsert: true, new: true }
    ).lean();

    if (previous && previous.publicId !== saved.publicId) await releaseAsset(previous);
    refresh();
    return NextResponse.json({ key: saved.key, url: saved.url, resourceType: saved.resourceType, width: saved.width, height: saved.height, updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
  } catch (error) {
    return handleError(error);
  }
}

// ?key=<slot> removes the upload; the slot goes back to its built-in file.
export async function DELETE(request) {
  try {
    const auth = await authorize(request, 'siteMedia.manage');
    if (!auth.admin) return denied(auth);
    const key = new URL(request.url).searchParams.get('key');
    if (!slotByKey(key)) return NextResponse.json({ message: 'Unknown image slot.' }, { status: 400 });

    await connectDB();
    const doc = await SiteMedia.findOneAndDelete({ key }).lean();
    if (doc) await releaseAsset(doc);
    refresh();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
