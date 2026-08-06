const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { generateToken } = require('../../utils/jwt');
const { generateOtp, getOtpExpiry, sendOtpSms } = require('../../utils/otp');

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

  await issueOtp(user.id, mobileNumber, 'REGISTRATION');

  return user;
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

  await issueOtp(user.id, mobileNumber, 'REGISTRATION');

  return user;
};

const issueOtp = async (userId, mobileNumber, purpose) => {
  const otpCode = generateOtp();
  const expiresAt = getOtpExpiry();

  await prisma.otpVerification.create({
    data: { userId, mobileNumber, otpCode, purpose, expiresAt },
  });

  await sendOtpSms(mobileNumber, otpCode);
  return true;
};

const resendOtp = async (mobileNumber, purpose) => {
  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(404, 'No account found with this Mobile Number');
  }
  await issueOtp(user.id, mobileNumber, purpose);
  return true;
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

  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
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
  return { admin, token };
};

const forgotPassword = async (mobileNumber) => {
  const user = await prisma.user.findUnique({ where: { mobileNumber } });
  if (!user) {
    throw new ApiError(404, 'No account found with this Mobile Number');
  }
  await issueOtp(user.id, mobileNumber, 'FORGOT_PASSWORD');
  return true;
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

module.exports = {
  registerGiver,
  registerSeeker,
  resendOtp,
  verifyOtp,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
};
