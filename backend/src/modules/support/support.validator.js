const { body, param, query } = require('express-validator');

const contactSupportValidator = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['GENERAL_INQUIRY', 'TECHNICAL_ISSUE', 'REPORT_A_PROBLEM'])
    .withMessage('Category must be one of GENERAL_INQUIRY, TECHNICAL_ISSUE, REPORT_A_PROBLEM'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
];

const idParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

const listSupportMessagesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('status').optional().isIn(['OPEN', 'RESOLVED']).withMessage('Invalid status filter'),
  query('category').optional()
    .isIn(['GENERAL_INQUIRY', 'TECHNICAL_ISSUE', 'REPORT_A_PROBLEM']).withMessage('Invalid category filter'),
];

const updateSupportStatusValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['OPEN', 'RESOLVED']).withMessage('Status must be OPEN or RESOLVED'),
];

module.exports = {
  contactSupportValidator,
  idParamValidator,
  listSupportMessagesValidator,
  updateSupportStatusValidator,
};
