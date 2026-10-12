import 'server-only';
import nodemailer from 'nodemailer';
import { getPrivateConfig } from './siteSettings';

// The mail account comes from SMTP_HOST / _PORT / _USER / _PASS / _FROM in
// .env. A transporter is reused until those change.
let cached = { key: '', transporter: null };

const transporterFor = (smtp) => {
  const key = JSON.stringify([smtp.host, smtp.port, smtp.user, smtp.pass]);
  if (cached.key !== key) {
    cached = {
      key,
      transporter: nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: { user: smtp.user, pass: smtp.pass },
      }),
    };
  }
  return cached.transporter;
};

/** True once an SMTP server, username and password are saved. */
export async function emailConfigured() {
  const { smtp } = await getPrivateConfig();
  return Boolean(smtp.host && smtp.user && smtp.pass);
}

/**
 * Sends an email. `html` must already be escaped: build it with
 * buildEmail() from ./emailLayout.js, never by interpolating raw user input.
 * Without `to`, it goes to the notification addresses (or the account itself).
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const { smtp, notifyEmails } = await getPrivateConfig();
  if (!smtp.host || !smtp.user || !smtp.pass) {
    console.warn('Email is not set up (SMTP_* in .env); skipping:', subject);
    return;
  }
  await transporterFor(smtp).sendMail({
    from: smtp.from || smtp.user,
    to: to || notifyEmails || smtp.user,
    subject,
    html,
    text,
    replyTo,
  });
};

/** Checks the login works without sending anything. */
export async function verifyEmailSettings() {
  const { smtp } = await getPrivateConfig();
  if (!smtp.host || !smtp.user || !smtp.pass) throw new Error('SMTP_HOST, SMTP_USER and SMTP_PASS are missing from the server environment.');
  await transporterFor(smtp).verify();
}

export default sendEmail;
