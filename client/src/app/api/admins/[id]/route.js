import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { authorize, revokeSessions } from '../../../../lib/auth';
import { adminRow, anotherActiveSuperadmin } from '../../../../lib/adminAccounts';
import { emailInvite, emailResetLink } from '../../../../lib/passwordLinks';
import { sendSecurityNotice } from '../../../../lib/authEmails';
import { clientIp } from '../../../../lib/rateLimit';
import { ROLES, ROLE_LABELS } from '../../../../lib/roles';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

const conflict = (message) => NextResponse.json({ message }, { status: 409 });
const LAST_SUPERADMIN = 'There must always be at least one active super admin. Make someone else a super admin first.';

async function load(request, params) {
  const auth = await authorize(request, 'admins.manage');
  if (!auth.admin) return { error: denied(auth) };
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { error: notFound() };
  await connectDB();
  const target = await Admin.findById(id).select('+lockUntil +failedLoginAttempts');
  if (!target) return { error: notFound() };
  return { me: auth.admin, target, isSelf: String(target._id) === auth.admin._id };
}

// One change per request: { role }, { isActive }, or { action } where action
// is unlock | reset-2fa | send-reset | resend-invite.
export async function PATCH(request, { params }) {
  try {
    const { error, me, target, isSelf } = await load(request, params);
    if (error) return error;
    const body = await request.json().catch(() => ({}));
    const ip = clientIp(request);

    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return NextResponse.json({ message: 'Unknown role.' }, { status: 400 });
      if (isSelf) return conflict('You can’t change your own role. Ask another super admin.');
      if (target.role === 'superadmin' && body.role !== 'superadmin' && !(await anotherActiveSuperadmin(target._id))) {
        return conflict(LAST_SUPERADMIN);
      }
      if (target.role !== body.role) {
        target.role = body.role;
        await target.save();
        await sendSecurityNotice(target, `Your role is now ${ROLE_LABELS[body.role]}`, ip);
      }
    } else if (typeof body.isActive === 'boolean') {
      if (isSelf) return conflict('You can’t deactivate your own account.');
      if (!body.isActive && target.role === 'superadmin' && !(await anotherActiveSuperadmin(target._id))) {
        return conflict(LAST_SUPERADMIN);
      }
      target.isActive = body.isActive;
      await target.save();
      // A deactivated admin is signed out at once and can't sign back in.
      if (!body.isActive) await revokeSessions(target._id);
    } else if (body.action === 'unlock') {
      target.failedLoginAttempts = 0;
      target.lockUntil = null;
      await target.save();
    } else if (body.action === 'reset-2fa') {
      if (isSelf) return conflict('Turn off your own two-step sign-in from Account & security.');
      await Admin.updateOne(
        { _id: target._id },
        { totpEnabled: false, totpSecret: null, totpPendingSecret: null, totpLastStep: 0 }
      );
      target.totpEnabled = false;
      await revokeSessions(target._id);
      await sendSecurityNotice(target, `Two-step sign-in was turned off by ${me.username}`, ip);
    } else if (body.action === 'send-reset') {
      if (target.isActive === false) return conflict('Reactivate the account first.');
      await emailResetLink(target);
    } else if (body.action === 'resend-invite') {
      if (target.isActive === false) return conflict('Reactivate the account first.');
      await emailInvite(target, me.username);
    } else {
      return NextResponse.json({ message: 'Nothing to change.' }, { status: 400 });
    }

    return NextResponse.json(adminRow(target.toObject()));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error, target, isSelf } = await load(request, params);
    if (error) return error;
    if (isSelf) return conflict('You can’t remove your own account.');
    if (target.role === 'superadmin' && !(await anotherActiveSuperadmin(target._id))) return conflict(LAST_SUPERADMIN);

    await revokeSessions(target._id);
    await target.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
