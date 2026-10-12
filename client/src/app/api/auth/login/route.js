import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { createSession, isSameOrigin, sessionCookie } from '../../../../lib/auth';
import { clearRateLimit, clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { handleError } from '../../../../lib/apiResponse';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

// Compared against when the email is unknown, so a wrong email takes as long
// as a wrong password and response timing doesn't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-just-for-timing', 12);

const invalid = () => NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
const tooMany = () =>
  NextResponse.json({ message: 'Too many sign-in attempts. Try again in 15 minutes or reset your password.' }, { status: 429 });

export async function POST(request) {
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ message: 'Bad origin.' }, { status: 403 });

    const ip = clientIp(request);
    if (isRateLimited(`login-ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 })) return tooMany();

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 120) : '';
    const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
    if (!email || !password) return invalid();
    if (isRateLimited(`login-email:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 })) return tooMany();

    await connectDB();
    const admin = await Admin.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');

    if (!admin || admin.isActive === false) {
      await bcrypt.compare(password, DUMMY_HASH);
      return invalid();
    }
    // A locked account answers like a wrong password, so attackers can't tell
    // the lock from a bad guess (and keep wasting attempts).
    if (admin.isLocked()) {
      await bcrypt.compare(password, DUMMY_HASH);
      return tooMany();
    }

    if (!(await admin.matchPassword(password))) {
      const attempts = (admin.failedLoginAttempts || 0) + 1;
      const update = { failedLoginAttempts: attempts };
      if (attempts >= MAX_FAILED_LOGINS) {
        update.failedLoginAttempts = 0;
        update.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      }
      await Admin.updateOne({ _id: admin._id }, update);
      return attempts >= MAX_FAILED_LOGINS ? tooMany() : invalid();
    }

    // Right password: earlier typos for this email stop counting.
    clearRateLimit(`login-email:${email}`);
    if (admin.failedLoginAttempts || admin.lockUntil) {
      await Admin.updateOne({ _id: admin._id }, { failedLoginAttempts: 0, lockUntil: null });
    }
    if (admin.needsRehash()) {
      admin.password = password; // re-hashed at today's cost by the pre-save hook
      await admin.save();
    }

    // With two-step sign-in on, this session only unlocks /api/auth/mfa.
    if (admin.totpEnabled) {
      const token = await createSession(admin, request, { pendingMfa: true });
      const response = NextResponse.json({ mfaRequired: true });
      response.cookies.set(sessionCookie(token, { pendingMfa: true }));
      return response;
    }

    await Admin.updateOne({ _id: admin._id }, { lastLoginAt: new Date(), lastLoginIp: ip });
    const token = await createSession(admin, request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie(token));
    return response;
  } catch (error) {
    return handleError(error);
  }
}
