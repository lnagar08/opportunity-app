const express = require('express');
const router = express.Router();

const controller = require('./content.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticateAdmin } = require('../../middleware/auth.middleware');
const { slugParamValidator, updateContentPageValidator } = require('./content.validator');

router.use(authenticateAdmin);

router.get('/', controller.listContentPages);
router.get('/:slug', slugParamValidator, validate, controller.getContentPage);
router.put('/:slug', updateContentPageValidator, validate, controller.updateContentPage);

module.exports = router;
