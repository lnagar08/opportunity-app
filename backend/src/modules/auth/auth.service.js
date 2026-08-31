const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { generateToken, generateAdminResetToken, verifyAdminResetToken } = require('../../utils/jwt');
const { generateOtp, getOtpExpiry, sendOtpSms, sendOtpEmail, OTP_RESEND_COOLDOWN_SECONDS } = require('../../utils/otp');
const { sendMail } = require('../../utils/mailer');
const { renderEmail, escapeHtml } = require('../../utils/emailTemplates');
const { generateRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllRefreshTokensFor } = require('../../utils/refreshToken');

const SALT_ROUNDS = 10;

const registerGiver = async (payload) => {
  const { fullName, mobileNumber, email, password, organizationName, city, state, acceptedTerms } = payload;

  const existing = await prisma.user.findUnique({ where: { mobileNumber } });
  if (existing) {
    throw new ApiError(409, 'Mobile Number is already registered');
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ApiError(409, 'Email is already registered');
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      mobileNumber,
      email: email || null,
      passwordHash,
      role: 'GIVER',
      city,
      state,
      acceptedTerms: acceptedTerms === true || acceptedTerms === 'true',
      giverProfile: {
        create: {
          organizationName: organizationName || null,
        },
      },
      notificationPref: {
        create: {},
      },
    },
    include: { giverProfile: true },
  });

  //await issueOtp(user.id, mobileNumber, 'REGISTRATION');
  const otpCode = await issueOtp(user.id, mobileNumber, 'REGISTRATION');
  return { ...user, otpCode };
};

const registerSeeker = async (payload, disabilityCertificateUrl) => {
  const {
    fullName, mobileNumber, email, password, dateOfBirth, gender,
    city, state, disabilityTypeId, acceptedTerms,
  } = payload;

  if (!disabilityCertificateUrl) {
    throw new ApiError(422, 'Disability Certificate Upload is required');
  }

  const existing = await prisma.user.findUnique({ where: { mobileNumber } });
  if (existing) {
    throw new ApiError(409, 'Mobile Number is already registered');
  }
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ApiError(409, 'Email is already registered');
    }
  }

  const disabilityType = await prisma.disabilityType.findUnique({ where: { id: disabilityTypeId } });
  if (!disabilityType) {
    throw new ApiError(400, 'Invalid Disability Type');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      mobileNumber,
      email: email || null,
      passwordHash,
      role: 'SEEKER',
      city,
      state,
      acceptedTerms: acceptedTerms === true || acceptedTerms === 'true',
      seekerProfile: {
        create: {
          dateOfBirth: new Date(dateOfBirth),
          gender: gender || null,
          disabilityTypeId,
          disabilityCertificateUrl,
          certificateStatus: 'PENDING',
        },
      },
      notificationPref: {
        create: {},
      },
    },
    include: { seekerProfile: true },
  });

  const otpCode = await issueOtp(user.id, mobileNumber, 'REGISTRATION');

  return { ...user, otpCode };
};

const issueOtp = async (userId, mobileNumber, purpose) => {
  const otpCode = generateOtp();
  const expiresAt = getOtpExpiry();

  await prisma.otpVerification.create({
    data: { userId, mobileNumber, otpCode, purpose, expiresAt },
  });

  await sendOtpSms(mobileNumber, otpCode);

  // Email is sent alongside SMS everywhere an OTP goes out — best-effort,
  // never blocks/fails this call (sendOtpEmail no-ops if there's no email
  // on file, and sendMail itself swallows its own errors).
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true } });
    sendOtpEmail(user?.email, user?.fullName, otpCode, purpose).catch(() => {});
  }
  return otpCode;
  //return true;
};

// Prevents hammering /otp/resend to spam SMS/email credits — one resend
// per mobile+purpose per OTP_RESEND_COOLDOWN_SECONDS (default 60s).
const enforceResendCooldown = async (mobileNumber, purpose) => {
  const lastOtp = await prisma.otpVerification.findFirst({
    where: { mobileNumber, purpose },
    orderBy: { createdAt: 'desc' },
  });
  if (!lastOtp) return;

  const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
  if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
    const waitSeconds = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
    throw new ApiError(429, `Please wait ${waitSeconds}s before requesting another OTP`);
  }
};

const resendOtp = async (mobileNumber, purpose) => {
  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(404, 'No account found with this Mobile Number');
  }
  await enforceResendCooldown(mobileNumber, purpose);
  const otpCode = await issueOtp(user.id, mobileNumber, purpose);
  return { otpCode };
};

const verifyOtp = async (mobileNumber, otp, purpose) => {
  const otpRecord = await prisma.otpVerification.findFirst({
    where: { mobileNumber, otpCode: otp, purpose, isUsed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new ApiError(400, 'Invalid OTP');
  }
  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP has expired');
  }

  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  let user = await prisma.user.findUnique({ where: { mobileNumber } });

  if (purpose === 'REGISTRATION' && user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isMobileVerified: true },
    });
  }

  return user;
};

const login = async (mobileNumber, password) => {
  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(401, 'Invalid Mobile Number or Password');
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Account is suspended or deactivated');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Invalid Mobile Number or Password');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  if(user.role === 'SEEKER'){
    const seekerProfile = await prisma.seekerProfile.findUnique({ where: { userId: user.id }, select: { isProfileCompleted: true } });
    user.isProfileCompleted = seekerProfile?.isProfileCompleted || false;
  }
  const token = generateToken({ id: user.id, role: user.role });
  const refreshToken = await generateRefreshToken({ userId: user.id });
  return { user, token, refreshToken };
};

const adminLogin = async (email, password) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ApiError(401, 'Invalid Email or Password');
  }
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Invalid Email or Password');
  }
  const token = generateToken({ adminId: admin.id, isSuperAdmin: admin.isSuperAdmin });
  const refreshToken = await generateRefreshToken({ adminId: admin.id });
  return { admin, token, refreshToken };
};

// SECURITY TRADE-OFF: reveals whether an email is a registered Admin.
// Only appropriate for internal-only admin panels with a small, trusted
// user base — never use this variant on a public-facing forgot-password
// endpoint (e.g. the Seeker/Giver one), where enumeration protection matters.
const adminForgotPassword = async (email) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ApiError(404, 'No admin account found with this email');
  }

  const resetToken = generateAdminResetToken(admin.id);
  const resetUrl = `${(process.env.PUBLIC_APP_URL || '').replace(/\/+$/, '')}/recover-password?token=${resetToken}`;

  await sendMail({
    to: admin.email,
    subject: 'Reset your Admin password',
    html: renderEmail({
      preheader: 'Use this link to reset your Admin password. It expires in 30 minutes.',
      title: 'Reset your password',
      bodyHtml: `
        <p>Hi ${escapeHtml(admin.fullName)},</p>
        <p>We received a request to reset your Admin account password. This link expires in 30 minutes and can only be used once.</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      `,
      cta: { label: 'Reset Password', url: resetUrl },
    }),
  });
};

const adminResetPassword = async (token, newPassword) => {
  let adminId;
  try {
    adminId = verifyAdminResetToken(token);
  } catch {
    throw new ApiError(400, 'This reset link is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });
  return true;
};

const adminChangePassword = async (adminId, currentPassword, newPassword) => {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  const match = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!match) throw new ApiError(400, 'Current Password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });
  return true;
};

const forgotPassword = async (mobileNumber) => {
  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(404, 'No account found with this Mobile Number');
  }
  const otpCode = await issueOtp(user.id, mobileNumber, 'FORGOT_PASSWORD');
  return { otpCode };
};

const resetPassword = async (mobileNumber, otp, newPassword) => {
  await verifyOtp(mobileNumber, otp, 'FORGOT_PASSWORD');

  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(404, 'No account found with this Mobile Number');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return true;
};

const refreshAccessToken = async (rawRefreshToken) => {
  const rotated = await rotateRefreshToken(rawRefreshToken);
  if (!rotated) {
    throw new ApiError(401, 'Refresh token is invalid, expired, or already used');
  }

  let accessToken;
  if (rotated.userId) {
    const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
    if (!user || user.status !== 'ACTIVE') throw new ApiError(401, 'Account is no longer active');
    accessToken = generateToken({ id: user.id, role: user.role });
  } else {
    const admin = await prisma.admin.findUnique({ where: { id: rotated.adminId } });
    if (!admin) throw new ApiError(401, 'Admin not found');
    accessToken = generateToken({ adminId: admin.id, isSuperAdmin: admin.isSuperAdmin });
  }

  return { accessToken, refreshToken: rotated.rawToken };
};

const logout = async (rawRefreshToken) => {
  await revokeRefreshToken(rawRefreshToken);
  return true;
};

module.exports = {
  registerGiver,
  registerSeeker,
  resendOtp,
  verifyOtp,
  login,
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  adminChangePassword,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
};
