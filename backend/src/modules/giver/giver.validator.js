const { body, param, query } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full Name must be 2-100 characters'),

  body('organizationName')
    .optional({ checkFalsy: true })
    .isLength({ max: 150 }).withMessage('Organization Name must be under 150 characters'),

  body('city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),

  body('state')
    .optional()
    .trim()
    .notEmpty().withMessage('State cannot be empty'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email must be a valid email address'),
];

const createOpportunityValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title must be under 150 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),

  body('categoryIds')
    .isArray({ min: 1, max: 3 }).withMessage('Select between 1 and 3 Categories'),

  body('categoryIds.*')
    .isUUID().withMessage('Each Category ID must be a valid UUID'),

  body('budgetType')
    .notEmpty().withMessage('Budget Type is required')
    .isIn(['FIXED', 'NEGOTIABLE']).withMessage('Budget Type must be FIXED or NEGOTIABLE'),

  body('budgetAmount')
    .if(body('budgetType').equals('FIXED'))
    .notEmpty().withMessage('Budget Amount is required for Fixed budget type')
    .isFloat({ gt: 0 }).withMessage('Budget Amount must be a positive number'),

  body('workMode')
    .notEmpty().withMessage('Remote / On-site is required')
    .isIn(['REMOTE', 'ONSITE', 'HYBRID']).withMessage('Work Mode must be REMOTE, ONSITE, or HYBRID'),

  body('city')
    .if(body('workMode').not().equals('REMOTE'))
    .trim()
    .notEmpty().withMessage('City is required for on-site/hybrid opportunities'),

  body('state')
    .if(body('workMode').not().equals('REMOTE'))
    .trim()
    .notEmpty().withMessage('State is required for on-site/hybrid opportunities'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('opportunityDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be a valid date'),

  body('opportunityTime')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:mm format'),
];

const updateOpportunityValidator = [
  param('id').isUUID().withMessage('Invalid Opportunity ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),

  body('categoryIds')
    .optional()
    .isArray({ min: 1, max: 3 }).withMessage('Select between 1 and 3 Categories'),

  body('categoryIds.*')
    .optional()
    .isUUID().withMessage('Each Category ID must be a valid UUID'),

  body('budgetType')
    .optional()
    .isIn(['FIXED', 'NEGOTIABLE']).withMessage('Budget Type must be FIXED or NEGOTIABLE'),

  body('budgetAmount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Budget Amount must be a positive number'),

  body('workMode')
    .optional()
    .isIn(['REMOTE', 'ONSITE', 'HYBRID']).withMessage('Work Mode must be REMOTE, ONSITE, or HYBRID'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('opportunityDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be a valid date'),

  body('opportunityTime')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:mm format'),
];

const idParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

const opportunityIdParamValidator = [
  param('opportunityId').isUUID().withMessage('Invalid Opportunity ID'),
];

const applicationIdParamValidator = [
  param('applicationId').isUUID().withMessage('Invalid Application ID'),
];

const updateApplicationStatusValidator = [
  param('applicationId').isUUID().withMessage('Invalid Application ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['SHORTLISTED', 'ACCEPTED', 'REJECTED']).withMessage('Invalid status value'),
];

const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('status').optional().isIn(['ACTIVE', 'CLOSED', 'DRAFT', 'DELETED']).withMessage('Invalid status filter'),
];

module.exports = {
  updateProfileValidator,
  createOpportunityValidator,
  updateOpportunityValidator,
  idParamValidator,
  opportunityIdParamValidator,
  applicationIdParamValidator,
  updateApplicationStatusValidator,
  listQueryValidator,
};
