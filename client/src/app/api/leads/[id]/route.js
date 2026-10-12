import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Lead, { LEAD_STATUSES } from '../../../../models/Lead';
import { authorize } from '../../../../lib/auth';
import { oneOf, str } from '../../../../lib/validate';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

export async function PATCH(request, { params }) {
  try {
    const auth = await authorize(request, 'leads.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const update = {};
    if (body.status !== undefined) update.status = oneOf(body.status, LEAD_STATUSES, 'Status');
    if (body.notes !== undefined) update.notes = str(body.notes, { max: 2000, label: 'Notes' });

    const lead = await Lead.findByIdAndUpdate(id, update, { new: true });
    return lead ? NextResponse.json(lead) : notFound();
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authorize(request, 'leads.delete');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const lead = await Lead.findByIdAndDelete(id);
    return lead ? NextResponse.json({ ok: true }) : notFound();
  } catch (error) {
    return handleError(error);
  }
}
