import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Contact from '../../../../models/Contact';
import { protect } from '../../../../lib/auth';
import { handleError, notFound, unauthorized } from '../../../../lib/apiResponse';

export async function PATCH(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;
    const { isRead } = await request.json();

    await connectDB();
    const message = await Contact.findByIdAndUpdate(id, { isRead: Boolean(isRead) }, { new: true });
    return message ? NextResponse.json(message) : notFound();
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;

    await connectDB();
    const message = await Contact.findByIdAndDelete(id);
    return message ? NextResponse.json({ ok: true }) : notFound();
  } catch (error) {
    return handleError(error);
  }
}
