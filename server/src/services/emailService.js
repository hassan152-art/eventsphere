const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs to console so local
 * development / demo environments never crash on a missing mail server.
 */
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[emailService] (SMTP not configured) Would send to ${to}: ${subject}`);
    return { simulated: true };
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM || 'EventSphere <no-reply@eventsphere.com>',
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
