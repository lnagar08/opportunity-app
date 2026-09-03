const nodemailer = require('nodemailer');

// Lazily built so a missing SMTP config doesn't crash the app at boot —
// it only matters once something actually tries to send an email.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true', // true for port 465, false for 587/25 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  return transporter;
};

/**
 * Sends an email. Never throws — logs and swallows failures so a broken
 * SMTP config can't take down an otherwise-successful API request (e.g. a
 * Contact Support submission should still save even if the notification
 * email fails to send).
 */
const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const client = getTransporter();
  if (!client) {
    console.warn(`[mailer] SMTP not configured — skipping email "${subject}" to ${to}`);
    return false;
  }

  try {
    await client.sendMail({
      from: `Opportunity App <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ' '),
      ...(replyTo && { replyTo }),
    });
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send email "${subject}" to ${to}:`, err.message);
    return false;
  }
};

module.exports = { sendMail };
