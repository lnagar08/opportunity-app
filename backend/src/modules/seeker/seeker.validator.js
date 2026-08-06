const { body, param, query } = require('express-validator');

// ---------------- PROFILE (core) ----------------

const updateProfileValidator = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),

  body('availableForRemote')
    .optional()
    .isBoolean().withMessage('availableForRemote must be boolean'),

  body('willingToTravel')
    .optional()
    .isBoolean().withMessage('willingToTravel must be boolean'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full Name must be 2-100 characters'),

  body('city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),

  body('state')
    .optional()
    .trim()
    .notEmpty().withMessage('State cannot be empty'),
];

const completeProfileValidator = [
  body('bio')
    .trim()
    .notEmpty().withMessage('Bio is required'),

  body('availableForRemote')
    .optional()
    .isBoolean().withMessage('availableForRemote must be boolean'),

  body('willingToTravel')
    .optional()
    .isBoolean().withMessage('willingToTravel must be boolean'),
];

// ---------------- EDUCATION ----------------

const educationValidator = [
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('degree').trim().notEmpty().withMessage('Degree is required'),
  body('fieldOfStudy').optional({ checkFalsy: true }).trim(),
  body('startYear')
    .notEmpty().withMessage('Start Year is required')
    .isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Start Year is invalid'),
  body('endYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage('End Year is invalid'),
  body('currentlyStudying')
    .optional()
    .isBoolean().withMessage('currentlyStudying must be boolean'),
];

// ---------------- EXPERIENCE ----------------

const experienceValidator = [
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('startDate')
    .notEmpty().withMessage('Start Date is required')
    .isISO8601().withMessage('Start Date must be a valid date'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('End Date must be a valid date'),
  body('currentlyWorking').optional().isBoolean().withMessage('currentlyWorking must be boolean'),
  body('fresher').optional().isBoolean().withMessage('fresher must be boolean'),
];

// ---------------- SKILLS ----------------

const skillValidator = [
  body('skillName').trim().notEmpty().withMessage('Skill Name is required')
    .isLength({ max: 60 }).withMessage('Skill Name must be under 60 characters'),
];

// ---------------- AWARDS ----------------

const awardValidator = [
  body('awardName').trim().notEmpty().withMessage('Award Name is required'),
  body('organization').optional({ checkFalsy: true }).trim(),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Year is invalid'),
];

// ---------------- CERTIFICATIONS ----------------

const certificationValidator = [
  body('certificationName').trim().notEmpty().withMessage('Certification Name is required'),
  body('issuedBy').optional({ checkFalsy: true }).trim(),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
];

// ---------------- PORTFOLIO ----------------

const portfolioValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional({ checkFalsy: true }).trim(),
];

// ---------------- COMMON PARAM ----------------

const idParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

// ---------------- SEARCH ----------------

const searchOpportunitiesValidator = [
  query('keyword').optional().trim(),
  query('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  query('budgetMin').optional().isFloat({ min: 0 }).withMessage('budgetMin must be a positive number'),
  query('budgetMax').optional().isFloat({ min: 0 }).withMessage('budgetMax must be a positive number'),
  query('datePosted').optional().isIn(['24h', '7d', '30d']).withMessage('datePosted must be 24h, 7d, or 30d'),
  query('workMode').optional().isIn(['REMOTE', 'ONSITE', 'HYBRID']).withMessage('Invalid Work Mode'),
  query('radiusKm').optional().isFloat({ min: 0, max: 500 }).withMessage('radiusKm must be 0-500'),
  query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('lat must be between -90 and 90'),
  query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('lng must be between -180 and 180'),
 
  // radiusKm, lat and lng are a set — providing one without the other two
  // silently did nothing before, so now it's a hard validation error.
  query('radiusKm').custom((value, { req }) => {
    const { lat, lng } = req.query;
    if (value !== undefined && (lat === undefined || lng === undefined)) {
      throw new Error('radiusKm requires both lat and lng to also be provided');
    }
    return true;
  }),
  query('lat').custom((value, { req }) => {
    const { radiusKm, lng } = req.query;
    if (value !== undefined && (radiusKm === undefined || lng === undefined)) {
      throw new Error('lat requires both radiusKm and lng to also be provided');
    }
    return true;
  }),
  query('lng').custom((value, { req }) => {
    const { radiusKm, lat } = req.query;
    if (value !== undefined && (radiusKm === undefined || lat === undefined)) {
      throw new Error('lng requires both radiusKm and lat to also be provided');
    }
    return true;
  }),
 
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
];

// ---------------- APPLY ----------------

const applyValidator = [
  param('id').isUUID().withMessage('Invalid Opportunity ID'),
  body('proposal')
    .trim()
    .notEmpty().withMessage('Proposal is required')
    .isLength({ max: 3000 }).withMessage('Proposal must be under 3000 characters'),
  body('proposedBudget')
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 }).withMessage('Proposed Budget must be a positive number'),
  body('questions')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Questions must be under 1000 characters'),
];

const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('status').optional()
    .isIn(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'])
    .withMessage('Invalid status filter'),
];

module.exports = {
  updateProfileValidator,
  completeProfileValidator,
  educationValidator,
  experienceValidator,
  skillValidator,
  awardValidator,
  certificationValidator,
  portfolioValidator,
  idParamValidator,
  searchOpportunitiesValidator,
  applyValidator,
  listQueryValidator,
};
