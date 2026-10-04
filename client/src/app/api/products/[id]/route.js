import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Product from '../../../../models/Product';
import { protect } from '../../../../lib/auth';
import { productInput } from '../../../../lib/catalog';
import { handleError, notFound, unauthorized } from '../../../../lib/apiResponse';

export async function PUT(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, productInput(await request.json()), {
      new: true,
      runValidators: true,
    });
    return product ? NextResponse.json(product) : notFound();
  } catch (error) {
    return handleError(error);
  }
}

// Partial update used by the show/hide toggle.
export async function PATCH(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;
    if (Number.isFinite(body.sortOrder)) update.sortOrder = body.sortOrder;

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    return product ? NextResponse.json(product) : notFound();
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;

    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    return product ? NextResponse.json({ ok: true }) : notFound();
  } catch (error) {
    return handleError(error);
  }
}
