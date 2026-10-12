import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { isSameOrigin } from '../../../../lib/auth';
import { clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { emailResetLink } from '../../../../lib/passwordLinks';
import { handleError } from '../../../../lib/apiResponse';

// Always the same answer, whether or not the email has an account, so this
// endpoint can't be used to find out who the admins are.
const GENERIC = {
  message: 'If that email belongs to an admin account, a reset link is on its way. It expires in 30 minutes.',
};

export async function POST(request) {
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ message: 'Bad origin.' }, { status: 403 });
    if (isRateLimited(`forgot-ip:${clientIp(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 })) {
      return NextResponse.json({ message: 'Too many requests. Try again in an hour.' }, { status: 429 });
    }

    const { email } = await request.json().catch(() => ({}));
    const address = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 120) : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }
    // One email per address every 10 minutes stops the inbox being flooded.
    if (isRateLimited(`forgot-email:${address}`, { limit: 1, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json(GENERIC);
    }

    await connectDB();
    const admin = await Admin.findOne({ email: address });
    if (admin && admin.isActive !== false) await emailResetLink(admin);

    return NextResponse.json(GENERIC);
  } catch (error) {
    return handleError(error);
  }
}
