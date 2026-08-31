const express = require('express');
const router = express.Router();

const controller = require('./admin.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticateAdmin, requireSuperAdmin } = require('../../middleware/auth.middleware');
const {
  idParamValidator,
  listUsersValidator,
  updateUserStatusValidator,
  reviewCertificateValidator,
  listOpportunitiesValidator,
  disabilityTypeValidator,
  categoryValidator,
  listReportsValidator,
  updateReportValidator,
  createAdminValidator,
  listInviteCandidatesValidator,
  inviteSeekerValidator,
  cityCreateValidator,
  cityUpdateValidator,
  stateValidator,
} = require('./admin.validator');

// All routes below require a valid Admin token
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard', controller.getDashboard);

// Seeker management
router.get('/seekers', listUsersValidator, validate, controller.listSeekers);
router.get('/seekers/:id', idParamValidator, validate, controller.getUserDetails);
router.patch(
  '/seekers/:id/certificate',
  reviewCertificateValidator,
  validate,
  controller.reviewCertificate
);

// Giver management
router.get('/givers', listUsersValidator, validate, controller.listGivers);
router.get('/givers/:id', idParamValidator, validate, controller.getUserDetails);

// Shared user status action (works for both roles)
router.patch('/users/:id/status', updateUserStatusValidator, validate, controller.updateUserStatus);

// Opportunity moderation
router.get('/opportunities', listOpportunitiesValidator, validate, controller.listOpportunities);
router.get('/opportunities/:id', idParamValidator, validate, controller.getOpportunityDetails);
router.patch('/opportunities/:id/close', idParamValidator, validate, controller.closeOpportunity);
router.delete('/opportunities/:id', idParamValidator, validate, controller.deleteOpportunity);

// "Invite Opportunity Seekers" — manual email invite from Opportunity Management
router.get(
  '/opportunities/:id/invite-candidates',
  listInviteCandidatesValidator, validate,
  controller.listInviteCandidates
);
router.post(
  '/opportunities/:id/invite',
  inviteSeekerValidator, validate,
  controller.inviteSeeker
);

// Master data: Disability Types
router.get('/master/disability-types', controller.listDisabilityTypes);
router.post('/master/disability-types', disabilityTypeValidator, validate, controller.createDisabilityType);
router.put(
  '/master/disability-types/:id',
  idParamValidator, disabilityTypeValidator, validate,
  controller.updateDisabilityType
);
router.delete('/master/disability-types/:id', idParamValidator, validate, controller.deleteDisabilityType);

// Master data: Categories
router.get('/master/categories', controller.listCategories);
router.post('/master/categories', categoryValidator, validate, controller.createCategory);
router.put(
  '/master/categories/:id',
  idParamValidator, categoryValidator, validate,
  controller.updateCategory
);
router.delete('/master/categories/:id', idParamValidator, validate, controller.deleteCategory);

// Reports & moderation
router.get('/reports', listReportsValidator, validate, controller.listReports);
router.get('/reports/:id', idParamValidator, validate, controller.getReportDetails);
router.patch('/reports/:id', updateReportValidator, validate, controller.updateReportStatus);

// Admin management (Super Admin only)
router.get('/admins', requireSuperAdmin, controller.listAdmins);
router.post('/admins', requireSuperAdmin, createAdminValidator, validate, controller.createAdmin);

router.get('/master/states', controller.listStates);
router.get('/master/cities', controller.listCities);
router.post('/master/cities', cityCreateValidator, validate, controller.createCity);
router.put('/master/cities/:id', idParamValidator, cityUpdateValidator, validate, controller.updateCity);
router.delete('/master/cities/:id', idParamValidator, validate, controller.deleteCity);

router.post('/master/states', stateValidator, validate, controller.createState);
router.put('/master/states/:id', idParamValidator, stateValidator, validate, controller.updateState);
router.delete('/master/states/:id', idParamValidator, validate, controller.deleteState);

module.exports = router;
