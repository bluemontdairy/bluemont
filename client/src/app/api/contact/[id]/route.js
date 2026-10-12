import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Contact from '../../../../models/Contact';
import { authorize } from '../../../../lib/auth';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

export async function PATCH(request, { params }) {
  try {
    const auth = await authorize(request, 'messages.edit');
    if (!auth.admin) return denied(auth);
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
    const auth = await authorize(request, 'messages.delete');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const message = await Contact.findByIdAndDelete(id);
    return message ? NextResponse.json({ ok: true }) : notFound();
  } catch (error) {
    return handleError(error);
  }
}
