const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');
const prisma = require('../config/db');

/**
 * Verifies the Bearer JWT and attaches req.user = { id, role, mobileNumber }
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token missing');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new ApiError(401, 'Invalid token: user not found');
    }
    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is suspended or deactivated');
    }

    req.user = { id: user.id, role: user.role, mobileNumber: user.mobileNumber };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(err);
  }
};

/**
 * Restricts a route to specific roles.
 * Usage: authorize('GIVER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Verifies the Bearer JWT for an Admin (separate table from User).
 * Token payload must include { adminId, isSuperAdmin }.
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token missing');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded.adminId) {
      throw new ApiError(401, 'Invalid admin token');
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
    if (!admin) {
      throw new ApiError(401, 'Invalid token: admin not found');
    }

    req.admin = { id: admin.id, email: admin.email, isSuperAdmin: admin.isSuperAdmin };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(err);
  }
};

/**
 * Restricts a route to super-admins only.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.isSuperAdmin) {
    return next(new ApiError(403, 'Only a Super Admin can perform this action'));
  }
  next();
};

module.exports = { authenticate, authorize, authenticateAdmin, requireSuperAdmin };
