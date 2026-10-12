import 'server-only';
import Admin from '../models/Admin';
import { randomToken, sha256 } from './secretBox';
import { getSiteUrl } from './siteSettings';
import { sendInviteEmail, sendPasswordResetEmail } from './authEmails';

export const RESET_MINUTES = 30;
export const INVITE_MINUTES = 72 * 60;

// The link to /admin/reset-password, used both for "forgot password" and for
// inviting a new admin. Only a SHA-256 hash of the token is stored, and the
// token travels in the #fragment: browsers never send fragments to a server,
// so it can't end up in access logs, analytics or a Referer header.
//
// The address comes from Site settings → Website address. Set it on every
// environment: until it is set, the request's own address is used, and a
// Host header can be forged.
async function issueLink(admin, minutes) {
  const token = randomToken();
  await Admin.updateOne(
    { _id: admin._id },
    { resetTokenHash: sha256(token), resetTokenExpires: new Date(Date.now() + minutes * 60 * 1000) }
  );
  return `${await getSiteUrl()}/admin/reset-password#token=${token}`;
}

export async function emailResetLink(admin) {
  await sendPasswordResetEmail(admin, await issueLink(admin, RESET_MINUTES), RESET_MINUTES);
}

export async function emailInvite(admin, invitedBy) {
  await sendInviteEmail(admin, await issueLink(admin, INVITE_MINUTES), INVITE_MINUTES, invitedBy);
}
