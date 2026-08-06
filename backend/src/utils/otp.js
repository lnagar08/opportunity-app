const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const getOtpExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Replace with a real SMS gateway integration (e.g. Twilio, MSG91) in production.
const sendOtpSms = async (mobileNumber, otpCode) => {
  console.log(`[OTP] Sending OTP ${otpCode} to ${mobileNumber}`);
  return true;
};

module.exports = { generateOtp, getOtpExpiry, sendOtpSms };
