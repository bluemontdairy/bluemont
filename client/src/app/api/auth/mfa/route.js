import { NextResponse } from 'next/server';
import Admin from '../../../../models/Admin';
import { clearedSessionCookie, createSession, currentSession, sessionCookie } from '../../../../lib/auth';
import { clientIp } from '../../../../lib/rateLimit';
import { unseal } from '../../../../lib/secretBox';
import { verifyTotp } from '../../../../lib/totp';
import { handleError } from '../../../../lib/apiResponse';

const MAX_ATTEMPTS = 5;

// Second sign-in step: the 6-digit code from the authenticator app.
export async function POST(request) {
  try {
    const result = await currentSession(request, { allowPendingMfa: true });
    if (!result?.session?.pendingMfa) {
      return NextResponse.json({ message: 'Your sign-in expired. Enter your password again.' }, { status: 401 });
    }
    const { session } = result;

    const { code } = await request.json().catch(() => ({}));
    const admin = await Admin.findById(session.admin).select('+totpSecret +totpLastStep');
    const step = admin ? verifyTotp(unseal(admin.totpSecret), code, admin.totpLastStep) : 0;

    if (!step) {
      session.mfaAttempts += 1;
      if (session.mfaAttempts >= MAX_ATTEMPTS) {
        await session.deleteOne();
        const response = NextResponse.json({ message: 'Too many wrong codes. Sign in again.' }, { status: 401 });
        response.cookies.set(clearedSessionCookie());
        return response;
      }
      await session.save();
      return NextResponse.json({ message: 'That code didn’t match. Check the time on your phone and try again.' }, { status: 400 });
    }

    // Swap the half-signed-in session for a full one with a fresh token.
    await session.deleteOne();
    await Admin.updateOne({ _id: admin._id }, { totpLastStep: step, lastLoginAt: new Date(), lastLoginIp: clientIp(request) });
    const token = await createSession(admin, request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie(token));
    return response;
  } catch (error) {
    return handleError(error);
  }
}
