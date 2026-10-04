import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import { protect } from '../../../lib/auth';
import { getActiveProducts, getAllProducts, productInput } from '../../../lib/catalog';
import { handleError, unauthorized } from '../../../lib/apiResponse';

// Public: active products, optionally filtered. Admins can pass ?all=1 to
// include hidden products.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let products;
    if (searchParams.get('all') === '1') {
      if (!(await protect(request))) return unauthorized();
      products = await getAllProducts();
    } else {
      products = await getActiveProducts();
    }

    const brand = searchParams.get('brand');
    const format = searchParams.get('format');
    if (brand) products = products.filter((p) => p.brand === brand);
    if (format) products = products.filter((p) => p.format === format);

    return NextResponse.json(products);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    if (!(await protect(request))) return unauthorized();

    await connectDB();
    const product = await Product.create(productInput(await request.json()));
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
