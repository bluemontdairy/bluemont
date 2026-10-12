import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { clearedSessionCookie, isSameOrigin, revokeSessions } from '../../../../lib/auth';
import { clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { sha256 } from '../../../../lib/secretBox';
import { passwordProblem } from '../../../../lib/password';
import { sendSecurityNotice } from '../../../../lib/authEmails';
import { handleError } from '../../../../lib/apiResponse';

const expired = () =>
  NextResponse.json({ message: 'This link is invalid or has expired. Ask for a new one.', expired: true }, { status: 400 });

export async function POST(request) {
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ message: 'Bad origin.' }, { status: 403 });
    const ip = clientIp(request);
    if (isRateLimited(`reset-ip:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json({ message: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const { token, password } = await request.json().catch(() => ({}));
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return expired();

    await connectDB();
    const admin = await Admin.findOne({
      resetTokenHash: sha256(token),
      resetTokenExpires: { $gt: new Date() },
    }).select('+password +resetTokenHash');
    if (!admin || admin.isActive === false) return expired();

    const problem = passwordProblem(password, admin);
    if (problem) return NextResponse.json({ message: problem }, { status: 400 });
    if (await admin.matchPassword(password)) {
      return NextResponse.json({ message: 'Choose a password you haven’t used for this account.' }, { status: 400 });
    }

    // New password, single-use token gone, lock cleared, every session ended.
    admin.password = password;
    admin.resetTokenHash = null;
    admin.resetTokenExpires = null;
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    await revokeSessions(admin._id);
    await sendSecurityNotice(admin, 'Your password was reset', ip);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(clearedSessionCookie());
    return response;
  } catch (error) {
    return handleError(error);
  }
}
