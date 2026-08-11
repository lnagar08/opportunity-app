const { body, param } = require('express-validator');

const slugParamValidator = [
  param('slug')
    .isIn(['terms-and-conditions', 'privacy-policy'])
    .withMessage('slug must be terms-and-conditions or privacy-policy'),
];

const updateContentPageValidator = [
  ...slugParamValidator,
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title must be under 150 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
];

module.exports = { slugParamValidator, updateContentPageValidator };
