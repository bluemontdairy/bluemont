import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';
import { getAllReviews } from '../../../../lib/reviews';
import ReviewsManager from '../../../../components/admin/ReviewsManager';

export const metadata = { title: 'Reviews' };

export default async function ReviewsPage() {
  const me = await getCurrentAdmin();
  if (!can(me, 'reviews.edit')) redirect('/admin');
  return <ReviewsManager initialReviews={await getAllReviews()} canDelete={can(me, 'reviews.delete')} />;
}
