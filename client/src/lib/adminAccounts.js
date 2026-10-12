import 'server-only';
import Admin from '../models/Admin';

// Shapes and rules for Admin → Admins.

/** What the admins list shows. Never includes hashes, tokens or secrets. */
export const adminRow = (a) => ({
  _id: String(a._id),
  username: a.username,
  email: a.email,
  role: a.role,
  isActive: a.isActive !== false,
  totpEnabled: !!a.totpEnabled,
  locked: Boolean(a.lockUntil && new Date(a.lockUntil) > new Date()),
  // Invited but has never set a password or signed in.
  pending: Boolean(a.invitedAt && !a.passwordChangedAt && !a.lastLoginAt),
  invitedBy: a.invitedBy || '',
  lastLoginAt: a.lastLoginAt ? new Date(a.lastLoginAt).toISOString() : null,
  createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
});

export const listAdmins = async () =>
  (await Admin.find().select('+lockUntil').sort({ role: 1, username: 1 }).lean()).map(adminRow);

/**
 * True if, after excluding `exceptId`, at least one active super admin is
 * left. Stops the last one being demoted, deactivated or removed.
 */
export async function anotherActiveSuperadmin(exceptId) {
  return Boolean(await Admin.exists({ _id: { $ne: exceptId }, role: 'superadmin', isActive: { $ne: false } }));
}
