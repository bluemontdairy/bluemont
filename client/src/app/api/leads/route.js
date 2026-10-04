import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Lead, { BUSINESS_TYPES, PARTNERSHIP_NEEDS } from '../../../models/Lead';
import { protect } from '../../../lib/auth';
import sendEmail from '../../../lib/sendEmail';
import { buildFieldsEmail, safeSubject } from '../../../lib/email';
import { appendLeadToSheet } from '../../../lib/sheets';
import { str, oneOf, someOf, nepaliMobile } from '../../../lib/validate';
import { clientIp, isRateLimited } from '../../../lib/rateLimit';
import { handleError, unauthorized } from '../../../lib/apiResponse';

export async function POST(request) {
  try {
    if (isRateLimited(`lead:${clientIp(request)}`, { limit: 5 })) {
      return NextResponse.json({ message: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    // Honeypot: real visitors never see or fill this field.
    if (body.website) return NextResponse.json({ ok: true }, { status: 201 });

    const input = {
      businessName: str(body.businessName, { max: 120, required: true, label: 'Business / store legal name' }),
      contactPerson: str(body.contactPerson, { max: 80, required: true, label: 'Contact person' }),
      mobileNumber: nepaliMobile(body.mobileNumber),
      location: str(body.location, { max: 160, required: true, label: 'Store location' }),
      businessType: oneOf(body.businessType, BUSINESS_TYPES, 'Type of business'),
      partnershipNeed: someOf(body.partnershipNeed, PARTNERSHIP_NEEDS, 'partnership / equipment need'),
      dailyFootfall: str(body.dailyFootfall, { max: 300, label: 'Footfall / brands handled' }),
    };

    await connectDB();
    const lead = await Lead.create(input);

    // Email and sheet run in parallel; a failure in either is logged but the
    // visitor still gets a success response because the lead is saved.
    const { html, text } = buildFieldsEmail('New B2B partner inquiry', [
      ['Business / store', input.businessName],
      ['Contact person', input.contactPerson],
      ['Mobile (WhatsApp)', input.mobileNumber],
      ['Location', input.location],
      ['Type of business', input.businessType],
      ['Needs', input.partnershipNeed],
      ['Footfall / brands handled', input.dailyFootfall],
    ]);

    const [emailResult, sheetResult] = await Promise.allSettled([
      sendEmail({ subject: safeSubject(`New B2B lead: ${input.businessName}`), html, text }),
      appendLeadToSheet(lead),
    ]);
    if (emailResult.status === 'rejected') console.error('Lead email failed', emailResult.reason);
    if (sheetResult.status === 'rejected') console.error('Lead sheet sync failed', sheetResult.reason);
    if (sheetResult.status === 'fulfilled' && sheetResult.value) {
      await Lead.updateOne({ _id: lead._id }, { sheetSynced: true });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request) {
  try {
    if (!(await protect(request))) return unauthorized();

    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(leads);
  } catch (error) {
    return handleError(error);
  }
}
