import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Review from '../../../../models/Review';
import { authorize } from '../../../../lib/auth';
import { destroyAsset } from '../../../../lib/cloudinary';
import { refreshReviews, reviewInput, serializeReview } from '../../../../lib/reviews';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

export async function PUT(request, { params }) {
  try {
    const auth = await authorize(request, 'reviews.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const input = reviewInput(await request.json());

    await connectDB();
    const previous = await Review.findById(id).lean();
    if (!previous) return notFound();
    const review = await Review.findByIdAndUpdate(id, { ...input, updatedBy: auth.admin.username }, { new: true, runValidators: true }).lean();
    if (previous.photoPublicId && previous.photoPublicId !== review.photoPublicId) await destroyAsset(previous.photoPublicId);
    refreshReviews();
    return NextResponse.json(serializeReview(review));
  } catch (error) {
    return handleError(error);
  }
}

// Partial update for the publish toggle and reordering.
export async function PATCH(request, { params }) {
  try {
    const auth = await authorize(request, 'reviews.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    await connectDB();
    const review = await Review.findById(id);
    if (!review) return notFound();
    if (typeof body.isPublished === 'boolean') {
      if (body.isPublished && !review.consent) {
        return NextResponse.json({ message: 'Tick “The customer agreed to be quoted” before publishing.' }, { status: 400 });
      }
      review.isPublished = body.isPublished;
    }
    if (Number.isFinite(body.sortOrder)) review.sortOrder = body.sortOrder;
    review.updatedBy = auth.admin.username;
    await review.save();
    refreshReviews();
    return NextResponse.json(serializeReview(review.toObject()));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authorize(request, 'reviews.delete');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const review = await Review.findByIdAndDelete(id);
    if (!review) return notFound();
    await destroyAsset(review.photoPublicId);
    refreshReviews();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
