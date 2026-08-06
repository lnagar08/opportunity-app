const express = require('express');
const router = express.Router();

const controller = require('./giver.controller');
const validate = require('../../middleware/validate.middleware');
const upload = require('../../middleware/upload.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  updateProfileValidator,
  createOpportunityValidator,
  updateOpportunityValidator,
  idParamValidator,
  opportunityIdParamValidator,
  applicationIdParamValidator,
  updateApplicationStatusValidator,
  listQueryValidator,
} = require('./giver.validator');

// All routes below require an authenticated Opportunity Giver
router.use(authenticate, authorize('GIVER'));

// Screen 25: My Profile
router.get('/profile', controller.getMyProfile);
router.put(
  '/profile',
  upload.single('profilePhoto'),
  updateProfileValidator,
  validate,
  controller.updateMyProfile
);

// Screen 18: Dashboard
router.get('/dashboard', controller.getDashboard);

// Screen 19/20/21: My Opportunities / Create / Edit / Details
router.post(
  '/opportunities',
  upload.array('media', 10),
  createOpportunityValidator,
  validate,
  controller.createOpportunity
);
router.get('/opportunities', listQueryValidator, validate, controller.listMyOpportunities);
router.get('/opportunities/:id', idParamValidator, validate, controller.getOpportunityDetails);
router.put('/opportunities/:id', upload.array('media', 10), updateOpportunityValidator, validate, controller.updateOpportunity);
router.patch('/opportunities/:id/close', idParamValidator, validate, controller.closeOpportunity);
router.delete('/opportunities/:id', idParamValidator, validate, controller.deleteOpportunity);

// Screen 22/23: Applications Received / Applicant Profile
router.get(
  '/opportunities/:opportunityId/applications',
  opportunityIdParamValidator,
  listQueryValidator,
  validate,
  controller.listApplications
);
router.get(
  '/applications/:applicationId',
  applicationIdParamValidator,
  validate,
  controller.getApplicantProfile
);
router.patch(
  '/applications/:applicationId/status',
  updateApplicationStatusValidator,
  validate,
  controller.updateApplicationStatus
);

module.exports = router;
