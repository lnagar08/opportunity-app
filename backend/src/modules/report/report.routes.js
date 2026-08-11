const express = require('express');
const router = express.Router();

const controller = require('./report.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { createReportValidator } = require('./report.validator');

router.use(authenticate);

// "Report" action available from an opportunity, an applicant/giver profile,
// or a chat message — targetType tells the backend which and derives
// reportedUserId accordingly (see report.service.js).
router.post('/', createReportValidator, validate, controller.createReport);
router.get('/mine', controller.listMyReports);

module.exports = router;