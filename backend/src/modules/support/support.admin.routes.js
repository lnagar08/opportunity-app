const express = require('express');
const router = express.Router();

const controller = require('./support.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticateAdmin } = require('../../middleware/auth.middleware');
const {
  idParamValidator,
  listSupportMessagesValidator,
  updateSupportStatusValidator,
} = require('./support.validator');

router.use(authenticateAdmin);

router.get('/', listSupportMessagesValidator, validate, controller.listSupportMessages);
router.get('/:id', idParamValidator, validate, controller.getSupportMessageDetails);
router.patch('/:id/status', updateSupportStatusValidator, validate, controller.updateSupportMessageStatus);

module.exports = router;
