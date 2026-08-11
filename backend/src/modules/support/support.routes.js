const express = require('express');
const router = express.Router();

const controller = require('./support.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { contactSupportValidator } = require('./support.validator');

router.use(authenticate);

// Screen 27: Settings -> Contact Support
router.post('/support/contact', contactSupportValidator, validate, controller.submitSupportMessage);
router.get('/support/contact', controller.listMySupportMessages);

module.exports = router;
