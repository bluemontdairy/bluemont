// Creates an admin account, or resets the password of an existing one.
//
//   npm run create-admin -- <email> <username> [superadmin|staff]
//
// The password is read from the ADMIN_PASSWORD env var or prompted for, so
// it never lands in shell history.

import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import Admin from '../src/models/Admin.js';

const [email, username, role = 'superadmin'] = process.argv.slice(2);
if (!email || !username || !['superadmin', 'staff'].includes(role)) {
  console.error('Usage: npm run create-admin -- <email> <username> [superadmin|staff]');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (expected in .env.local).');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Password (min 10 characters): ');
  rl.close();
}
if (!password || password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  let admin = await Admin.findOne({ email: email.toLowerCase() });
  if (admin) {
    admin.password = password;
    admin.role = role;
    await admin.save();
    console.log(`Updated password for ${admin.email}.`);
  } else {
    admin = await Admin.create({ email, username, password, role });
    console.log(`Created ${role} ${admin.email}.`);
  }
} finally {
  await mongoose.disconnect();
}
