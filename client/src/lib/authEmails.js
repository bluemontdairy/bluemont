import 'server-only';
import sendEmail, { emailConfigured } from './sendEmail';
import { buildEmail } from './emailLayout';
import { getSiteUrl } from './siteSettings';
import { ROLE_LABELS } from './roles';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kathmandu',
});


const duration = (minutes) => (minutes >= 120 ? `${Math.round(minutes / 60)} hours` : `${minutes} minutes`);

const ACCOUNT_REASON = 'You’re getting this because this address has an account on the Blue Mont website admin.';

// Until email is set up (SMTP_* in .env), links are printed to the server
// console in development so the flow can still be tested; in production
// they are never logged.
const devFallback = (label, admin, link) => {
  if (process.env.NODE_ENV !== 'production') console.info(`[dev] ${label} for ${admin.email}: ${link}`);
  else console.error(`SMTP is not configured; cannot send ${label.toLowerCase()} email.`);
};

/** "Forgot password" link. */
export async function sendPasswordResetEmail(admin, link, minutes) {
  if (!(await emailConfigured())) return devFallback('Password reset link', admin, link);
  const content = {
    mascot: 'monster.main',
    preheader: `Choose a new password for the Blue Mont admin. The link expires in ${duration(minutes)}.`,
    eyebrow: 'Password reset',
    title: 'Let’s get you back in',
    greeting: `Hi ${admin.username},`,
    paragraphs: [
      'Someone (hopefully you) asked to reset the password for your Blue Mont website admin account. Tap the button to choose a new one.',
      `The link works once and expires in ${duration(minutes)}.`,
    ],
    button: { label: 'Choose a new password', url: link },
    linkFallback: true,
    note: 'Didn’t ask for this? You can safely ignore this email: your password stays the same. Blue Mont will never ask for your password by email or phone.',
    noteIcon: 'lock',
    reason: ACCOUNT_REASON,
  };
  await sendEmail({ to: admin.email, subject: 'Reset your Blue Mont admin password', ...(await buildEmail(content)) });
}

/** Invitation for a new admin: set a password, then sign in. */
export async function sendInviteEmail(admin, link, minutes, invitedBy) {
  if (!(await emailConfigured())) return devFallback('Admin invite link', admin, link);
  const role = ROLE_LABELS[admin.role] || admin.role;
  const content = {
    mascot: 'home.value-mascot',
    preheader: `${invitedBy} added you to the Blue Mont website admin. Set your password to get started.`,
    eyebrow: 'You’re invited',
    title: 'Welcome to the team!',
    greeting: `Hi ${admin.username},`,
    paragraphs: [
      `${invitedBy} has given you access to the Blue Mont Dairy website admin, where we look after products, partner leads and customer messages.`,
      `Set your password to get started. The link works once and expires in ${duration(minutes)}.`,
    ],
    rows: [
      ['Sign in with', admin.email],
      ['Your role', role],
    ],
    button: { label: 'Set my password', url: link },
    linkFallback: true,
    note: 'Link expired? Use “Forgot your password?” on the sign-in page and we’ll send a fresh one.',
    noteIcon: 'clock',
    reason: `You’re getting this because ${invitedBy} invited ${admin.email} to the Blue Mont website admin.`,
  };
  await sendEmail({ to: admin.email, subject: 'You’ve been added to the Blue Mont admin', ...(await buildEmail(content)) });
}

/** Security notice after a password change, reset, 2FA or role change. */
export async function sendSecurityNotice(admin, what, ip) {
  if (!(await emailConfigured())) return;
  const content = {
    mascot: 'monster.chocolate',
    preheader: `${what} on your Blue Mont admin account.`,
    eyebrow: 'Security notice',
    title: 'Account update',
    greeting: `Hi ${admin.username},`,
    paragraphs: ['A quick heads-up about a change to your Blue Mont admin account. If this was you, there’s nothing else to do.'],
    rows: [
      ['What happened', what],
      ['When', `${dateFmt.format(new Date())} (Nepal time)`],
      ['From IP address', ip || 'unknown'],
    ],
    button: { label: 'Review my account', url: `${await getSiteUrl()}/admin/account` },
    note: 'Wasn’t you? Reset your password from the sign-in page straight away and tell the site owner.',
    noteIcon: 'lock',
    reason: ACCOUNT_REASON,
  };
  try {
    await sendEmail({ to: admin.email, subject: `Blue Mont admin: ${what}`, ...(await buildEmail(content)) });
  } catch (error) {
    console.error('Security notice email failed', error?.message);
  }
}
