import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import Admin from '../../../../models/Admin';
import { currentSession, revokeSessions } from '../../../../lib/auth';
import { clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { seal, unseal } from '../../../../lib/secretBox';
import { generateTotpSecret, otpauthUrl, verifyTotp } from '../../../../lib/totp';
import { sendSecurityNotice } from '../../../../lib/authEmails';
import { handleError, unauthorized } from '../../../../lib/apiResponse';

const limited = (admin) => isRateLimited(`2fa:${admin._id}`, { limit: 10, windowMs: 15 * 60 * 1000 });
const tooMany = () => NextResponse.json({ message: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

const checkPassword = async (adminId, password) => {
  const admin = await Admin.findById(adminId).select('+password +totpSecret +totpPendingSecret +totpLastStep');
  const ok = typeof password === 'string' && (await admin.matchPassword(password));
  return ok ? admin : null;
};

// Step 1: confirm the password, get a new secret + QR code to scan.
export async function POST(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    if (limited(result.admin)) return tooMany();

    const { password } = await request.json().catch(() => ({}));
    const admin = await checkPassword(result.admin._id, password);
    if (!admin) return NextResponse.json({ message: 'Your password is wrong.' }, { status: 400 });
    if (admin.totpEnabled) return NextResponse.json({ message: 'Two-step sign-in is already on.' }, { status: 400 });

    const secret = generateTotpSecret();
    admin.totpPendingSecret = seal(secret);
    await admin.save();

    const uri = otpauthUrl({ secret, account: admin.email });
    const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
    return NextResponse.json({ secret, qr });
  } catch (error) {
    return handleError(error);
  }
}

// Step 2: prove the app works by entering a code; then it's switched on.
export async function PUT(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    if (limited(result.admin)) return tooMany();

    const { code } = await request.json().catch(() => ({}));
    const admin = await Admin.findById(result.admin._id).select('+totpPendingSecret +totpLastStep');
    const secret = unseal(admin.totpPendingSecret);
    if (!secret) return NextResponse.json({ message: 'Start the setup again.' }, { status: 400 });

    const step = verifyTotp(secret, code);
    if (!step) return NextResponse.json({ message: 'That code didn’t match. Try the newest one in the app.' }, { status: 400 });

    admin.totpSecret = seal(secret);
    admin.totpPendingSecret = null;
    admin.totpEnabled = true;
    admin.totpLastStep = step;
    await admin.save();
    // Other browsers signed in with just a password are signed out.
    await revokeSessions(admin._id, { exceptSessionId: result.session._id });
    await sendSecurityNotice(admin, 'Two-step sign-in was turned on', clientIp(request));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

// Turn it off: needs the password and a current code.
export async function DELETE(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    if (limited(result.admin)) return tooMany();

    const { password, code } = await request.json().catch(() => ({}));
    const admin = await checkPassword(result.admin._id, password);
    if (!admin) return NextResponse.json({ message: 'Your password is wrong.' }, { status: 400 });
    const step = verifyTotp(unseal(admin.totpSecret), code, admin.totpLastStep);
    if (!step) return NextResponse.json({ message: 'That code didn’t match.' }, { status: 400 });

    admin.totpEnabled = false;
    admin.totpSecret = null;
    admin.totpPendingSecret = null;
    admin.totpLastStep = 0;
    await admin.save();
    await sendSecurityNotice(admin, 'Two-step sign-in was turned off', clientIp(request));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
