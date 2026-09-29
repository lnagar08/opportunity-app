const { body } = require('express-validator');

const createReportValidator = [
  body('targetType')
  .notEmpty().withMessage('targetType is required')
  .isIn(['OPPORTUNITY', 'CONVERSATION']).withMessage('targetType must be OPPORTUNITY or CONVERSATION'),

  body('targetId')
    .notEmpty().withMessage('targetId is required')
    .isUUID().withMessage('targetId must be a valid UUID'),

  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ max: 1000 }).withMessage('Reason must be under 1000 characters'),
];

module.exports = { createReportValidator };