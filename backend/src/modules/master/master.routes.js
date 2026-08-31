const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');

const controller = require('./master.controller');

// Public — no auth required. These populate dropdown/select fields that
// appear before login (e.g. Disability Type on the Seeker registration
// screen) as well as after login (Category picker on Create Opportunity,
// Search filters). Every field in the app whose options come from a DB
// table (not a fixed enum) gets its own endpoint here.

// Screen 4: Seeker Registration -> Disability Type dropdown
router.get('/disability-types', controller.listDisabilityTypes);

// Screen 20 (Create/Edit Opportunity) + Screen 10 (Search filter) -> Category dropdown
router.get('/categories', controller.listCategories);

router.get(
  '/states',
  controller.listStates
);

router.get(
  '/cities',
  query('stateId').optional().isUUID().withMessage('stateId must be a valid UUID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    next();
  },
  controller.listCities
);

module.exports = router;
