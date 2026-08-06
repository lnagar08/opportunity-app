const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chain(s) on a route.
 * Collects all field errors and returns a single 422 response.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: formatted,
  });
};

module.exports = validate;
