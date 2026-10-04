import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Lead, { LEAD_STATUSES } from '../../../../models/Lead';
import { protect } from '../../../../lib/auth';
import { appendLeadToSheet } from '../../../../lib/sheets';
import { oneOf, str } from '../../../../lib/validate';
import { handleError, notFound, unauthorized } from '../../../../lib/apiResponse';

export async function PATCH(request, { params }) {
  try {
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;
    const body = await request.json();

    await connectDB();

    // Retry the Google Sheet copy for a lead that failed to sync.
    if (body.resyncSheet) {
      const lead = await Lead.findById(id);
      if (!lead) return notFound();
      await appendLeadToSheet(lead);
      lead.sheetSynced = true;
      await lead.save();
      return NextResponse.json(lead);
    }

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
    if (!(await protect(request))) return unauthorized();
    const { id } = await params;

    await connectDB();
    const lead = await Lead.findByIdAndDelete(id);
    return lead ? NextResponse.json({ ok: true }) : notFound();
  } catch (error) {
    return handleError(error);
  }
}
