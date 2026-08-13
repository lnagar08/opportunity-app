const { body, param, query } = require('express-validator');

const idParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).withMessage('Invalid status filter'),
  query('certificateStatus').optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid certificateStatus filter'),
];

const updateUserStatusValidator = [
  param('id').isUUID().withMessage('Invalid User ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).withMessage('Invalid status value'),
  body('reason')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
];

const reviewCertificateValidator = [
  param('id').isUUID().withMessage('Invalid User ID'),
  body('certificateStatus')
    .notEmpty().withMessage('certificateStatus is required')
    .isIn(['APPROVED', 'REJECTED']).withMessage('certificateStatus must be APPROVED or REJECTED'),
  body('rejectReason')
    .if(body('certificateStatus').equals('REJECTED'))
    .trim()
    .notEmpty().withMessage('rejectReason is required when rejecting a certificate'),
];

const listOpportunitiesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('status').optional()
    .isIn(['DRAFT', 'ACTIVE', 'CLOSED', 'DELETED']).withMessage('Invalid status filter'),
  query('search').optional().trim(),
];

const disabilityTypeValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const listReportsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('status').optional()
    .isIn(['PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN']).withMessage('Invalid status filter'),
  query('targetType').optional()
    .isIn(['USER', 'OPPORTUNITY', 'MESSAGE']).withMessage('Invalid targetType filter'),
];

const updateReportValidator = [
  param('id').isUUID().withMessage('Invalid Report ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['REVIEWED', 'DISMISSED', 'ACTION_TAKEN']).withMessage('Invalid status value'),
  body('adminNote')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('adminNote must be under 1000 characters'),
  body('suspendReportedUser')                                    // ADDED
    .optional()                                                  // ADDED
    .isBoolean().withMessage('suspendReportedUser must be boolean'), // ADDED
];

const createAdminValidator = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('isSuperAdmin').optional().isBoolean().withMessage('isSuperAdmin must be boolean'),
];


const listInviteCandidatesValidator = [
  param('id').isUUID().withMessage('Invalid Opportunity ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('search').optional().trim(),
];
 
const inviteSeekerValidator = [
  param('id').isUUID().withMessage('Invalid Opportunity ID'),
  body('seekerId')
    .notEmpty().withMessage('seekerId is required')
    .isUUID().withMessage('seekerId must be a valid UUID'),
];

module.exports = {
  idParamValidator,
  listUsersValidator,
  updateUserStatusValidator,
  reviewCertificateValidator,
  listOpportunitiesValidator,
  disabilityTypeValidator,
  categoryValidator,
  listReportsValidator,
  updateReportValidator,
  createAdminValidator,
  listInviteCandidatesValidator,
  inviteSeekerValidator,
};
