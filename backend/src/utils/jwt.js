const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Single-purpose token for Admin password reset links — deliberately
// short-lived and carries a `purpose` claim so it can never be mistaken
// for (or misused as) a normal Bearer auth token even though it's signed
// with the same secret. authenticateAdmin explicitly rejects any token
// that carries a `purpose` claim — see middleware/auth.middleware.js.
const ADMIN_PASSWORD_RESET_PURPOSE = 'ADMIN_PASSWORD_RESET';

const generateAdminResetToken = (adminId) => {
  return jwt.sign({ adminId, purpose: ADMIN_PASSWORD_RESET_PURPOSE }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
};

const verifyAdminResetToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.purpose !== ADMIN_PASSWORD_RESET_PURPOSE) {
    throw new Error('Invalid reset token');
  }
  return decoded.adminId;
};

module.exports = { generateToken, verifyToken, generateAdminResetToken, verifyAdminResetToken };