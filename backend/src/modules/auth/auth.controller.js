const { success } = require('../../utils/apiResponse');
const authService = require('./auth.service');
const { generateToken } = require('../../utils/jwt');
const { toFileUrl } = require('../../utils/fileUrl');

const registerGiver = async (req, res, next) => {
  try {
    const user = await authService.registerGiver(req.body);
    return success(res, 201, 'Registration successful. OTP sent for verification.', {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

const registerSeeker = async (req, res, next) => {
  try {
    const disabilityCertificateUrl = req.file ? toFileUrl(req, req.file.filename) : null;
    const user = await authService.registerSeeker(req.body, disabilityCertificateUrl);
    return success(res, 201, 'Registration successful. Certificate submitted for verification.', {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { mobileNumber, purpose } = req.body;
    await authService.resendOtp(mobileNumber, purpose);
    return success(res, 200, 'OTP resent successfully');
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { mobileNumber, otp, purpose } = req.body;
    const user = await authService.verifyOtp(mobileNumber, otp, purpose);

    const token = user ? generateToken({ id: user.id, role: user.role }) : null;

    return success(res, 200, 'OTP verified successfully', {
      user: user
        ? { id: user.id, fullName: user.fullName, role: user.role, isMobileVerified: user.isMobileVerified }
        : null,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;
    const { user, token, refreshToken } = await authService.login(mobileNumber, password);

    return success(res, 200, 'Login successful', {
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isMobileVerified: user.isMobileVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { admin, token, refreshToken } = await authService.adminLogin(email, password);
    return success(res, 200, 'Login successful', {
      token,
      refreshToken,
      admin: { id: admin.id, fullName: admin.fullName, email: admin.email, isSuperAdmin: admin.isSuperAdmin },
    });
  } catch (err) {
    next(err);
  }
};

const adminForgotPassword = async (req, res, next) => {
  try {
    await authService.adminForgotPassword(req.body.email);
    // Always the same response, whether or not the email matched an
    // Admin — prevents this endpoint from being used to enumerate
    // registered Admin accounts.
    return success(res, 200, 'If that email is registered, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

const adminResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.adminResetPassword(token, newPassword);
    return success(res, 200, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};

const adminChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.adminChangePassword(req.admin.id, currentPassword, newPassword);
    return success(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    await authService.forgotPassword(mobileNumber);
    return success(res, 200, 'OTP sent to reset your password');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { mobileNumber, otp, newPassword } = req.body;
    await authService.resetPassword(mobileNumber, otp, newPassword);
    return success(res, 200, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.refreshAccessToken(req.body.refreshToken);
    return success(res, 200, 'Token refreshed successfully', { accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
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
