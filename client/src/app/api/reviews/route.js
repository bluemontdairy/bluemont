import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Review from '../../../models/Review';
import { authorize } from '../../../lib/auth';
import { getAllReviews, getPublishedReviews, refreshReviews, reviewInput, serializeReview } from '../../../lib/reviews';
import { denied, handleError } from '../../../lib/apiResponse';

// Public: published reviews. ?all=1 (admins) includes drafts.
export async function GET(request) {
  try {
    if (new URL(request.url).searchParams.get('all') === '1') {
      const auth = await authorize(request, 'reviews.edit');
      if (!auth.admin) return denied(auth);
      return NextResponse.json(await getAllReviews());
    }
    return NextResponse.json(await getPublishedReviews());
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await authorize(request, 'reviews.edit');
    if (!auth.admin) return denied(auth);
    await connectDB();
    const review = await Review.create({ ...reviewInput(await request.json()), updatedBy: auth.admin.username });
    refreshReviews();
    return NextResponse.json(serializeReview(review.toObject()), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
