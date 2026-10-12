import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import { authorize, protect } from '../../../lib/auth';
import { getAdminCatalog, getActiveProducts, productInput } from '../../../lib/catalog';
import { refreshCatalog } from '../../../lib/catalogCache';
import { denied, handleError, unauthorized } from '../../../lib/apiResponse';

// Public: active products, optionally filtered by ?category=<slug>,
// ?brand=<slug> or ?format=<name>. Admins can pass ?all=1 to include hidden
// products.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let products;
    if (searchParams.get('all') === '1') {
      if (!(await protect(request))) return unauthorized();
      products = (await getAdminCatalog()).products;
    } else {
      products = await getActiveProducts();
    }

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const format = searchParams.get('format');
    if (category) products = products.filter((p) => p.category?.slug === category);
    if (brand) products = products.filter((p) => p.brand === brand);
    if (format) products = products.filter((p) => p.format === format);

    return NextResponse.json(products);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await authorize(request, 'products.edit');
    if (!auth.admin) return denied(auth);

    await connectDB();
    const product = await Product.create(await productInput(await request.json()));
    refreshCatalog();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
