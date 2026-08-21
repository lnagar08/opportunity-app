const { body } = require('express-validator');

const registerGiverValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full Name must be 2-100 characters'),

  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirm Password must match Password'),

  body('organizationName')
    .optional({ checkFalsy: true })
    .isLength({ max: 150 }).withMessage('Organization Name must be under 150 characters'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('acceptedTerms')
    .notEmpty().withMessage('You must accept Terms & Privacy Policy')
    .custom((value) => value === true || value === 'true')
    .withMessage('You must accept Terms & Privacy Policy'),
];

const registerSeekerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full Name must be 2-100 characters'),

  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirm Password must match Password'),

  body('dateOfBirth')
    .notEmpty().withMessage('Date of Birth is required')
    .isISO8601().withMessage('Date of Birth must be a valid date')
    .custom((value) => {
      const age = (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 14) throw new Error('You must be at least 14 years old to register');
      return true;
    }),

  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).withMessage('Invalid Gender value'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('disabilityTypeId')
    .notEmpty().withMessage('Disability Type is required')
    .isUUID().withMessage('Disability Type must be a valid ID'),

  body('acceptedTerms')
    .notEmpty().withMessage('You must accept Terms & Privacy Policy')
    .custom((value) => value === true || value === 'true')
    .withMessage('You must accept Terms & Privacy Policy'),
];

const adminLoginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const loginValidator = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const otpVerifyValidator = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),

  body('purpose')
    .notEmpty().withMessage('Purpose is required')
    .isIn(['REGISTRATION', 'LOGIN', 'FORGOT_PASSWORD', 'CHANGE_MOBILE'])
    .withMessage('Invalid OTP purpose'),
];

const resendOtpValidator = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('purpose')
    .notEmpty().withMessage('Purpose is required')
    .isIn(['REGISTRATION', 'LOGIN', 'FORGOT_PASSWORD', 'CHANGE_MOBILE'])
    .withMessage('Invalid OTP purpose'),
];

const forgotPasswordValidator = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),
];

const resetPasswordValidator = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('Mobile Number must be a valid 10-digit number'),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),

  body('newPassword')
    .notEmpty().withMessage('New Password is required')
    .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New Password must contain at least one number'),

  body('confirmNewPassword')
    .notEmpty().withMessage('Confirm New Password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm New Password must match New Password'),
];

const adminForgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address'),
];

const adminResetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty().withMessage('New Password is required')
    .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New Password must contain at least one number'),
  body('confirmNewPassword')
    .notEmpty().withMessage('Confirm New Password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm New Password must match New Password'),
];

const adminChangePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current Password is required'),
  body('newPassword')
    .notEmpty().withMessage('New Password is required')
    .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New Password must contain at least one number'),
  body('confirmNewPassword')
    .notEmpty().withMessage('Confirm New Password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm New Password must match New Password'),
];

const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
];

module.exports = {
  registerGiverValidator,
  registerSeekerValidator,
  loginValidator,
  adminLoginValidator,
  adminForgotPasswordValidator,
  adminResetPasswordValidator,
  adminChangePasswordValidator,
  otpVerifyValidator,
  resendOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  refreshTokenValidator,
};
