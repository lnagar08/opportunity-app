const express = require('express');
const router = express.Router();

const controller = require('./seeker.controller');
const validate = require('../../middleware/validate.middleware');
const upload = require('../../middleware/upload.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
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
  mediaIdParamValidator,
} = require('./seeker.validator');

// All routes below require an authenticated Opportunity Seeker
router.use(authenticate, authorize('SEEKER'));

// Screen 17: My Profile
router.get('/profile', controller.getMyProfile);
router.put(
  '/profile',
  upload.single('profilePhoto'),
  updateProfileValidator,
  validate,
  controller.updateMyProfile
);

// Screen 8: Complete Profile (Mandatory)
router.post(
  '/profile/complete',
  upload.single('profilePhoto'),
  completeProfileValidator,
  validate,
  controller.completeProfile
);

// Screen 8: Education (Add/Edit/Delete)
router.post('/profile/education', educationValidator, validate, controller.addEducation);
router.put('/profile/education/:id', idParamValidator, educationValidator, validate, controller.updateEducation);
router.delete('/profile/education/:id', idParamValidator, validate, controller.deleteEducation);

// Screen 8: Experience (Add/Edit/Delete)
router.post('/profile/experience', experienceValidator, validate, controller.addExperience);
router.put('/profile/experience/:id', idParamValidator, experienceValidator, validate, controller.updateExperience);
router.delete('/profile/experience/:id', idParamValidator, validate, controller.deleteExperience);

// Screen 8: Skills (Add/Edit/Delete)
router.post('/profile/skills', skillValidator, validate, controller.addSkill);
router.put('/profile/skills/:id', idParamValidator, skillValidator, validate, controller.updateSkill);
router.delete('/profile/skills/:id', idParamValidator, validate, controller.deleteSkill);

// Screen 8: Awards (Add/Edit/Delete)
router.post('/profile/awards', awardValidator, validate, controller.addAward);
router.put('/profile/awards/:id', idParamValidator, awardValidator, validate, controller.updateAward);
router.delete('/profile/awards/:id', idParamValidator, validate, controller.deleteAward);

// Screen 8: Certifications (Add/Edit/Delete)
router.post('/profile/certifications', certificationValidator, validate, controller.addCertification);
router.put(
  '/profile/certifications/:id',
  idParamValidator, certificationValidator, validate, controller.updateCertification
);
router.delete('/profile/certifications/:id', idParamValidator, validate, controller.deleteCertification);

// Screen 8: Portfolio (Add/Edit/Delete) - multipart, field `media[]` (images/audio/video)
router.post(
  '/profile/portfolio',
  upload.array('media', 10),
  portfolioValidator,
  validate,
  controller.addPortfolio
);
router.put(
  '/profile/portfolio/:id',
  upload.array('media', 10),
  idParamValidator, portfolioValidator, validate,
  controller.updatePortfolio
);
router.delete('/profile/portfolio/:id', idParamValidator, validate, controller.deletePortfolio);
router.delete(
  '/profile/portfolio/:id/media/:mediaId',
  idParamValidator, mediaIdParamValidator, validate,
  controller.deletePortfolioMedia
);

// Screen 9: Home
router.get('/home', controller.getHome);

// Screen 10: Search Opportunities
router.get('/opportunities/search', searchOpportunitiesValidator, validate, controller.searchOpportunities);

// Screen 11: Opportunity Details (+ apply eligibility flags)
router.get('/opportunities/:id', idParamValidator, validate, controller.getOpportunityDetails);

// Screen 12: Apply to Opportunity - multipart, field `attachments[]` (max 5: images/audio/video/pdf)
router.post(
  '/opportunities/:id/apply',
  upload.array('attachments', 5),
  applyValidator,
  validate,
  controller.applyToOpportunity
);

// Screen 13: My Applications
router.get('/applications', listQueryValidator, validate, controller.listMyApplications);

// Screen 14: Application Details
router.get('/applications/:id', idParamValidator, validate, controller.getApplicationDetails);
router.patch('/applications/:id/withdraw', idParamValidator, validate, controller.withdrawApplication);

module.exports = router;
