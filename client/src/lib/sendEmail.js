import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Sends a notification email. `html` must already be escaped — build it with
 * buildFieldsEmail() from ./email.js, never by interpolating raw user input.
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not set; skipping email:', subject);
    return;
  }
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: to || process.env.MANAGEMENT_EMAIL || process.env.SMTP_USER,
    subject,
    html,
    text,
    replyTo,
  });
};

export default sendEmail;
