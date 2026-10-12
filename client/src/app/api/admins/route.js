import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Admin from '../../../models/Admin';
import { authorize } from '../../../lib/auth';
import { listAdmins, adminRow } from '../../../lib/adminAccounts';
import { emailInvite } from '../../../lib/passwordLinks';
import { randomToken } from '../../../lib/secretBox';
import { ROLES } from '../../../lib/roles';
import { email as emailField, oneOf, str, ValidationError } from '../../../lib/validate';
import { denied, handleError } from '../../../lib/apiResponse';

export async function GET(request) {
  try {
    const auth = await authorize(request, 'admins.manage');
    if (!auth.admin) return denied(auth);
    await connectDB();
    return NextResponse.json(await listAdmins());
  } catch (error) {
    return handleError(error);
  }
}

// Invite a new admin. The account gets a random password nobody knows, and
// an email with a link to choose their own (valid 72 hours).
export async function POST(request) {
  try {
    const auth = await authorize(request, 'admins.manage');
    if (!auth.admin) return denied(auth);

    const body = await request.json().catch(() => ({}));
    const address = emailField(body.email, 'Email').toLowerCase();
    if (!address) throw new ValidationError('Email is required.');
    const username = str(body.username, { max: 40, required: true, label: 'Name' });
    if (!/^[\p{L}\p{N} ._'-]{2,40}$/u.test(username)) throw new ValidationError('Use 2–40 letters, numbers, spaces, dots or dashes for the name.');
    const role = oneOf(body.role, ROLES, 'Role');

    await connectDB();
    if (await Admin.exists({ $or: [{ email: address }, { username }] })) {
      return NextResponse.json({ message: 'An admin with that email or name already exists.' }, { status: 409 });
    }

    const admin = await Admin.create({
      email: address,
      username,
      role,
      password: randomToken(),
      invitedBy: auth.admin.username,
      invitedAt: new Date(),
    });
    // The account exists either way; if the email fails, the invite can be
    // re-sent from the list.
    let emailFailed = false;
    try {
      await emailInvite(admin, auth.admin.username);
    } catch (error) {
      console.error('Invite email failed', error?.message);
      emailFailed = true;
    }
    return NextResponse.json({ ...adminRow(admin.toObject()), emailFailed }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
