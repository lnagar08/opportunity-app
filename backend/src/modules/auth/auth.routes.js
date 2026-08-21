const express = require('express');
const router = express.Router();

const controller = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const upload = require('../../middleware/upload.middleware');
const { authenticateAdmin } = require('../../middleware/auth.middleware');
const {
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
} = require('./auth.validator');

// Screen 5: Opportunity Giver Registration
router.post('/giver/register', registerGiverValidator, validate, controller.registerGiver);

// Screen 4: Opportunity Seeker Registration (multipart - field: disabilityCertificate)
router.post(
  '/seeker/register',
  upload.single('disabilityCertificate'),
  registerSeekerValidator,
  validate,
  controller.registerSeeker
);

// Screen 6: OTP Verification (shared by both roles)
router.post('/otp/verify', otpVerifyValidator, validate, controller.verifyOtp);
router.post('/otp/resend', resendOtpValidator, validate, controller.resendOtp);

// Screen 2: Login (shared)
router.post('/login', loginValidator, validate, controller.login);

// Admin Login (separate Admin table)
router.post('/admin/login', adminLoginValidator, validate, controller.adminLogin);
router.post('/admin/forgot-password', adminForgotPasswordValidator, validate, controller.adminForgotPassword);
router.post('/admin/reset-password', adminResetPasswordValidator, validate, controller.adminResetPassword);
router.put(
  '/admin/change-password',
  authenticateAdmin,
  adminChangePasswordValidator, validate,
  controller.adminChangePassword
);

// Forgot Password flow
router.post('/forgot-password', forgotPasswordValidator, validate, controller.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, controller.resetPassword);

router.post('/refresh-token', refreshTokenValidator, validate, controller.refreshAccessToken);
router.post('/logout', refreshTokenValidator, validate, controller.logout);

module.exports = router;
