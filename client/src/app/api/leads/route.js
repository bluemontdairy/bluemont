import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Lead, { BUSINESS_TYPES, PARTNERSHIP_NEEDS } from '../../../models/Lead';
import { protect } from '../../../lib/auth';
import sendEmail from '../../../lib/sendEmail';
import { safeSubject } from '../../../lib/email';
import { buildEmail } from '../../../lib/emailLayout';
import { getSiteInfo } from '../../../lib/siteSettings';
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

    const info = await getSiteInfo();
    const { html, text } = await buildEmail({
      mascot: 'home.partner-mascot',
      preheader: `${input.businessName} in ${input.location} wants to stock Blue Mont.`,
      eyebrow: 'New partner lead',
      title: 'A shop wants in!',
      greeting: `${input.businessName} wants Blue Mont in their freezer.`,
      paragraphs: [
        `${input.contactPerson} filled in the “Want us in your place?” form. Reply quickly while they’re keen: a WhatsApp message works best.`,
      ],
      rows: [
        ['Business / store', input.businessName],
        ['Contact person', input.contactPerson],
        ['Mobile (WhatsApp)', input.mobileNumber],
        ['Location', input.location],
        ['Type of business', input.businessType],
        ['Needs', input.partnershipNeed],
        ['Footfall / brands handled', input.dailyFootfall],
      ],
      button: {
        label: `WhatsApp ${input.contactPerson.split(' ')[0]}`,
        url: `https://wa.me/977${input.mobileNumber}?text=${encodeURIComponent(
          `Namaste ${input.contactPerson}, this is Blue Mont Dairy about stocking our ice cream at ${input.businessName}.`
        )}`,
      },
      secondary: { label: 'Open partner leads', url: `${info.siteUrl}/admin/leads` },
      reason: 'You’re getting this because this inbox receives Blue Mont website leads.',
    });

    // The lead is saved either way; a failed email is only logged.
    try {
      await sendEmail({ to: info.notifyEmails || undefined, subject: safeSubject(`New B2B lead: ${input.businessName}`), html, text });
    } catch (error) {
      console.error('Lead email failed', error);
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
