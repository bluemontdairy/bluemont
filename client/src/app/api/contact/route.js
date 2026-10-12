import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Contact from '../../../models/Contact';
import { protect } from '../../../lib/auth';
import sendEmail from '../../../lib/sendEmail';
import { safeSubject } from '../../../lib/email';
import { buildEmail } from '../../../lib/emailLayout';
import { getSiteInfo } from '../../../lib/siteSettings';
import { str, email, nepaliMobile } from '../../../lib/validate';
import { clientIp, isRateLimited } from '../../../lib/rateLimit';
import { handleError, unauthorized } from '../../../lib/apiResponse';

export async function POST(request) {
  try {
    if (isRateLimited(`contact:${clientIp(request)}`, { limit: 5 })) {
      return NextResponse.json({ message: 'Too many messages. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    if (body.website) return NextResponse.json({ ok: true }, { status: 201 });

    const input = {
      name: str(body.name, { max: 80, required: true, label: 'Name' }),
      email: email(body.email),
      phone: nepaliMobile(body.phone, 'Phone'),
      message: str(body.message, { max: 3000, required: true, label: 'Message' }),
    };

    await connectDB();
    await Contact.create(input);

    try {
      const info = await getSiteInfo();
      const { html, text } = await buildEmail({
        mascot: 'home.scoop-mascot',
        preheader: `${input.name}: ${input.message.slice(0, 90)}`,
        eyebrow: 'Website message',
        title: 'You’ve got mail',
        greeting: `${input.name} sent a message through the website.`,
        paragraphs: [
          input.email
            ? 'Reply to this email to answer them directly.'
            : 'They didn’t leave an email address, so call or WhatsApp them instead.',
        ],
        rows: [
          ['Name', input.name],
          ['Email', input.email],
          ['Phone', input.phone],
          ['Message', input.message],
        ],
        button: { label: 'Open messages', url: `${info.siteUrl}/admin/messages` },
        reason: 'You’re getting this because this inbox receives Blue Mont website messages.',
      });
      await sendEmail({
        to: info.notifyEmails || undefined,
        subject: safeSubject(`New message from ${input.name}`),
        html,
        text,
        replyTo: input.email || undefined,
      });
    } catch (emailError) {
      console.error('Contact email failed', emailError);
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
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(messages);
  } catch (error) {
    return handleError(error);
  }
}
