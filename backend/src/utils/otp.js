const { sendMail } = require('./mailer');
const { renderEmail, escapeHtml } = require('./emailTemplates');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const getOtpExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);

// Replace with a real SMS gateway integration (e.g. Twilio, MSG91) in production.
const sendOtpSms = async (mobileNumber, otpCode) => {
  console.log(`[OTP] Sending OTP ${otpCode} to ${mobileNumber}`);
  return true;
};

const PURPOSE_COPY = {
  REGISTRATION: { title: 'Verify your account', intro: 'Use the code below to verify your mobile number and finish creating your account.' },
  LOGIN: { title: 'Your login code', intro: 'Use the code below to log in.' },
  FORGOT_PASSWORD: { title: 'Reset your password', intro: 'Use the code below to reset your password.' },
  CHANGE_MOBILE: { title: 'Confirm your new mobile number', intro: 'Use the code below to confirm this mobile number change.' },
};

// OTP is sent over SMS AND email everywhere it's issued (registration,
// login, forgot-password, change-mobile) — email is best-effort (see
// sendMail's own internal try/catch) and never blocks the SMS path or the
// calling request if it fails or SMTP isn't configured.
const sendOtpEmail = async (email, fullName, otpCode, purpose) => {
  if (!email) return; // email is optional at registration — nothing to send to
  const copy = PURPOSE_COPY[purpose] || PURPOSE_COPY.REGISTRATION;

  await sendMail({
    to: email,
    subject: `Your verification code: ${otpCode}`,
    html: renderEmail({
      preheader: `Your verification code is ${otpCode}`,
      title: copy.title,
      bodyHtml: `
        <p>Hi ${escapeHtml(fullName || 'there')},</p>
        <p>${copy.intro}</p>
        <p style="margin:24px 0; text-align:center;">
          <span style="display:inline-block; padding:12px 28px; font-size:28px; font-weight:700; letter-spacing:6px; background-color:#F3F4F6; border-radius:6px; color:#1F2937;">
            ${otpCode}
          </span>
        </p>
        <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || '5'} minutes. If you didn't request this, you can ignore this email.</p>
      `,
    }),
  });
};

module.exports = { generateOtp, getOtpExpiry, sendOtpSms, sendOtpEmail, OTP_RESEND_COOLDOWN_SECONDS };
