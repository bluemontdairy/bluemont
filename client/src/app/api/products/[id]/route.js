import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Product from '../../../../models/Product';
import { authorize } from '../../../../lib/auth';
import { productInput } from '../../../../lib/catalog';
import { refreshCatalog } from '../../../../lib/catalogCache';
import { destroyAsset } from '../../../../lib/cloudinary';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

// Several products can share one packshot (e.g. every Big Cup flavour), so a
// replaced image is only deleted from Cloudinary when nothing else uses it.
async function releaseImage(publicId) {
  if (!publicId) return;
  if (await Product.exists({ imagePublicId: publicId })) return;
  await destroyAsset(publicId);
}

export async function PUT(request, { params }) {
  try {
    const auth = await authorize(request, 'products.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const input = await productInput(await request.json());

    await connectDB();
    const previous = await Product.findById(id).lean();
    if (!previous) return notFound();
    const product = await Product.findByIdAndUpdate(id, input, { new: true, runValidators: true });

    if (previous.imagePublicId !== product.imagePublicId) await releaseImage(previous.imagePublicId);
    refreshCatalog();
    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

// Partial update used by the show/hide and featured toggles.
export async function PATCH(request, { params }) {
  try {
    const auth = await authorize(request, 'products.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;
    if (typeof body.featured === 'boolean') update.featured = body.featured;
    if (Number.isFinite(body.sortOrder)) update.sortOrder = body.sortOrder;

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return notFound();
    refreshCatalog();
    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authorize(request, 'products.delete');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return notFound();
    await releaseImage(product.imagePublicId);
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
