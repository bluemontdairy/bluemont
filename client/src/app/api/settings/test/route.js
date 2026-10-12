import { NextResponse } from 'next/server';
import { authorize } from '../../../../lib/auth';
import sendEmail, { verifyEmailSettings } from '../../../../lib/sendEmail';
import { pingCloudinary } from '../../../../lib/cloudinary';
import { buildEmail } from '../../../../lib/emailLayout';
import { getSiteUrl } from '../../../../lib/siteSettings';
import { isRateLimited } from '../../../../lib/rateLimit';
import { denied, handleError } from '../../../../lib/apiResponse';

// Checks saved connection settings: { kind: 'email' } signs in to the mail
// server and sends a test email to the admin who clicked; { kind: 'cloudinary' }
// pings the Cloudinary account.
export async function POST(request) {
  try {
    const auth = await authorize(request, 'settings.manage');
    if (!auth.admin) return denied(auth);
    if (isRateLimited(`settings-test:${auth.admin._id}`, { limit: 10, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json({ message: 'Too many tests. Try again in a few minutes.' }, { status: 429 });
    }
    const { kind } = await request.json().catch(() => ({}));

    if (kind === 'cloudinary') {
      try {
        await pingCloudinary();
      } catch (error) {
        return NextResponse.json({ message: `Cloudinary didn’t accept these details: ${error?.error?.message || error.message}` }, { status: 400 });
      }
      return NextResponse.json({ message: 'Cloudinary is connected.' });
    }

    if (kind === 'email') {
      try {
        await verifyEmailSettings();
      } catch (error) {
        return NextResponse.json({ message: `The mail server refused the login: ${error.message}` }, { status: 400 });
      }
      const siteUrl = await getSiteUrl();
      await sendEmail({
        to: auth.admin.email,
        subject: 'Blue Mont admin: test email',
        ...(await buildEmail({
          mascot: 'home.value-mascot',
          preheader: 'Email sending works.',
          eyebrow: 'Test email',
          title: 'It works!',
          greeting: `Hi ${auth.admin.username},`,
          paragraphs: ['This is a test from Admin → Site settings. If you’re reading it, the website can send email: password resets, invites and lead alerts will arrive.'],
          button: { label: 'Back to settings', url: `${siteUrl}/admin/settings` },
          reason: 'You’re getting this because you clicked “Send test email” in the Blue Mont admin.',
        })),
      });
      return NextResponse.json({ message: `Test email sent to ${auth.admin.email}.` });
    }

    return NextResponse.json({ message: 'Unknown test.' }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
