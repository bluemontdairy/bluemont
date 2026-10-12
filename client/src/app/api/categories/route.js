import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Category from '../../../models/Category';
import { authorize, protect } from '../../../lib/auth';
import { categoryInput, getAdminCatalog, getPublicCatalog } from '../../../lib/catalog';
import { refreshCatalog } from '../../../lib/catalogCache';
import { denied, handleError, unauthorized } from '../../../lib/apiResponse';

// Public: active categories with their field definitions. ?all=1 (admins)
// includes hidden ones.
export async function GET(request) {
  try {
    if (new URL(request.url).searchParams.get('all') === '1') {
      if (!(await protect(request))) return unauthorized();
      return NextResponse.json((await getAdminCatalog()).categories);
    }
    return NextResponse.json((await getPublicCatalog()).categories);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await authorize(request, 'categories.manage');
    if (!auth.admin) return denied(auth);
    await connectDB();
    const category = await Category.create(categoryInput(await request.json()));
    refreshCatalog();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
