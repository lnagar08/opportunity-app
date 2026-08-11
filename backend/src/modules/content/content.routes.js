const express = require('express');
const router = express.Router();

const controller = require('./content.controller');
const validate = require('../../middleware/validate.middleware');
const { slugParamValidator } = require('./content.validator');

// Public — no auth. Screen 27 (Settings -> Terms & Conditions / Privacy
// Policy) and the registration screens' "Accept Terms" link both read from
// here, before any login exists.
router.get('/:slug', slugParamValidator, validate, controller.getContentPage);

module.exports = router;
