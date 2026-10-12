// Creates an admin account, or resets the password of an existing one.
//
//   npm run create-admin -- <email> <username> [superadmin|staff]
//   npm run create-admin -- <email> <username> [role] --reset-2fa
//   npm run create-admin -- <email> --remove
//
// The password is read from the ADMIN_PASSWORD env var or prompted for, so
// it never lands in shell history. Resetting a password signs the account
// out everywhere and clears any lock. --reset-2fa also turns off two-step
// sign-in, for an admin who lost their phone.

import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import Admin from '../src/models/Admin.js';
import AdminSession from '../src/models/AdminSession.js';
import { passwordProblem } from '../src/lib/password.js';

const args = process.argv.slice(2);
const reset2fa = args.includes('--reset-2fa');
const [email, username, role = 'superadmin'] = args.filter((a) => !a.startsWith('--'));

// Delete an account and its sessions.
if (args.includes('--remove')) {
  if (!email || !process.env.MONGODB_URI) {
    console.error('Usage: npm run create-admin -- <email> --remove');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Admin.findOneAndDelete({ email: email.toLowerCase() });
  if (admin) await AdminSession.deleteMany({ admin: admin._id });
  console.log(admin ? `Removed ${admin.email}.` : `No admin with email ${email}.`);
  await mongoose.disconnect();
  process.exit(0);
}

if (!email || !username || !['superadmin', 'staff'].includes(role)) {
  console.error('Usage: npm run create-admin -- <email> <username> [superadmin|staff] [--reset-2fa]');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env).');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Password (min 12 characters): ');
  rl.close();
}
const problem = passwordProblem(password, { email, username });
if (problem) {
  console.error(problem);
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  let admin = await Admin.findOne({ email: email.toLowerCase() });
  if (admin) {
    admin.password = password;
    admin.role = role;
    admin.isActive = true;
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    if (reset2fa) {
      admin.totpEnabled = false;
      admin.totpSecret = null;
      admin.totpPendingSecret = null;
      admin.totpLastStep = 0;
    }
    await admin.save();
    await AdminSession.deleteMany({ admin: admin._id });
    console.log(`Updated password for ${admin.email} and signed it out everywhere.${reset2fa ? ' Two-step sign-in is off.' : ''}`);
  } else {
    admin = await Admin.create({ email, username, password, role });
    console.log(`Created ${role} ${admin.email}.`);
  }
} finally {
  await mongoose.disconnect();
}
