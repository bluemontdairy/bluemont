import { NextResponse } from 'next/server';
import Admin from '../../../../models/Admin';
import { currentSession, revokeSessions } from '../../../../lib/auth';
import { clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { passwordProblem } from '../../../../lib/password';
import { sendSecurityNotice } from '../../../../lib/authEmails';
import { handleError, unauthorized } from '../../../../lib/apiResponse';

// Change password while signed in. Needs the current password; signs out
// every other browser.
export async function POST(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    const ip = clientIp(request);
    if (isRateLimited(`password:${result.admin._id}`, { limit: 5, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json({ message: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    const { currentPassword, newPassword } = await request.json().catch(() => ({}));
    const admin = await Admin.findById(result.admin._id).select('+password');
    if (typeof currentPassword !== 'string' || !(await admin.matchPassword(currentPassword))) {
      return NextResponse.json({ message: 'Your current password is wrong.' }, { status: 400 });
    }
    const problem = passwordProblem(newPassword, admin);
    if (problem) return NextResponse.json({ message: problem }, { status: 400 });
    if (newPassword === currentPassword) {
      return NextResponse.json({ message: 'The new password must be different.' }, { status: 400 });
    }

    admin.password = newPassword;
    await admin.save();
    await revokeSessions(admin._id, { exceptSessionId: result.session._id });
    await sendSecurityNotice(admin, 'Your password was changed', ip);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
