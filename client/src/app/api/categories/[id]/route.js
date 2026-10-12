import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Category from '../../../../models/Category';
import Product from '../../../../models/Product';
import { authorize } from '../../../../lib/auth';
import { categoryInput } from '../../../../lib/catalog';
import { refreshCatalog } from '../../../../lib/catalogCache';
import { destroyAsset } from '../../../../lib/cloudinary';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

export async function PUT(request, { params }) {
  try {
    const auth = await authorize(request, 'categories.manage');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const input = categoryInput(await request.json());

    await connectDB();
    const previous = await Category.findById(id).lean();
    if (!previous) return notFound();
    const category = await Category.findByIdAndUpdate(id, input, { new: true, runValidators: true });

    if (previous.imagePublicId && previous.imagePublicId !== category.imagePublicId) await destroyAsset(previous.imagePublicId);
    refreshCatalog();
    return NextResponse.json(category);
  } catch (error) {
    return handleError(error);
  }
}

// A category that still has products can't be deleted: move or delete the
// products first (or hide the category instead).
export async function DELETE(request, { params }) {
  try {
    const auth = await authorize(request, 'categories.manage');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const inUse = await Product.countDocuments({ category: id });
    if (inUse > 0) {
      return NextResponse.json(
        { message: `${inUse} product${inUse === 1 ? ' is' : 's are'} still in this category. Move them first, or hide the category instead.` },
        { status: 409 }
      );
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) return notFound();
    await destroyAsset(category.imagePublicId);
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
