const { success } = require('../../utils/apiResponse');
const service = require('./admin.service');

// ---------------- DASHBOARD ----------------

const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboardStats();
    return success(res, 200, 'Dashboard stats fetched successfully', data);
  } catch (err) { next(err); }
};

// ---------------- SEEKERS ----------------

const listSeekers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, certificateStatus } = req.query;
    const data = await service.listUsers('SEEKER', { page, limit, search, status, certificateStatus });
    return success(res, 200, 'Seekers fetched successfully', data);
  } catch (err) { next(err); }
};

// ---------------- GIVERS ----------------

const listGivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const data = await service.listUsers('GIVER', { page, limit, search, status });
    return success(res, 200, 'Givers fetched successfully', data);
  } catch (err) { next(err); }
};

// ---------------- SHARED USER ACTIONS ----------------

const getUserDetails = async (req, res, next) => {
  try {
    const user = await service.getUserDetails(req.params.id);
    return success(res, 200, 'User details fetched successfully', user);
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await service.updateUserStatus(req.params.id, req.body.status);
    return success(res, 200, 'User status updated successfully', user);
  } catch (err) { next(err); }
};

const reviewCertificate = async (req, res, next) => {
  try {
    const profile = await service.reviewCertificate(
      req.params.id, req.body.certificateStatus, req.body.rejectReason
    );
    return success(res, 200, 'Certificate reviewed successfully', profile);
  } catch (err) { next(err); }
};

// ---------------- OPPORTUNITY MODERATION ----------------

const listOpportunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const data = await service.listAllOpportunities({ page, limit, status, search });
    return success(res, 200, 'Opportunities fetched successfully', data);
  } catch (err) { next(err); }
};

const getOpportunityDetails = async (req, res, next) => {
  try {
    const data = await service.getOpportunityDetails(req.params.id);
    return success(res, 200, 'Opportunity details fetched successfully', data);
  } catch (err) { next(err); }
};

const closeOpportunity = async (req, res, next) => {
  try {
    const data = await service.closeOpportunity(req.params.id);
    return success(res, 200, 'Opportunity closed successfully', data);
  } catch (err) { next(err); }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    await service.deleteOpportunity(req.params.id);
    return success(res, 200, 'Opportunity deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- MASTER DATA: DISABILITY TYPES ----------------

const listDisabilityTypes = async (req, res, next) => {
  try {
    const data = await service.listDisabilityTypes();
    return success(res, 200, 'Disability Types fetched successfully', data);
  } catch (err) { next(err); }
};
const createDisabilityType = async (req, res, next) => {
  try {
    const data = await service.createDisabilityType(req.body);
    return success(res, 201, 'Disability Type created successfully', data);
  } catch (err) { next(err); }
};
const updateDisabilityType = async (req, res, next) => {
  try {
    const data = await service.updateDisabilityType(req.params.id, req.body);
    return success(res, 200, 'Disability Type updated successfully', data);
  } catch (err) { next(err); }
};
const deleteDisabilityType = async (req, res, next) => {
  try {
    await service.deleteDisabilityType(req.params.id);
    return success(res, 200, 'Disability Type deactivated successfully');
  } catch (err) { next(err); }
};

// ---------------- MASTER DATA: CATEGORIES ----------------

const listCategories = async (req, res, next) => {
  try {
    const data = await service.listCategories();
    return success(res, 200, 'Categories fetched successfully', data);
  } catch (err) { next(err); }
};
const createCategory = async (req, res, next) => {
  try {
    const data = await service.createCategory(req.body);
    return success(res, 201, 'Category created successfully', data);
  } catch (err) { next(err); }
};
const updateCategory = async (req, res, next) => {
  try {
    const data = await service.updateCategory(req.params.id, req.body);
    return success(res, 200, 'Category updated successfully', data);
  } catch (err) { next(err); }
};
const deleteCategory = async (req, res, next) => {
  try {
    await service.deleteCategory(req.params.id);
    return success(res, 200, 'Category deactivated successfully');
  } catch (err) { next(err); }
};

// ---------------- REPORTS ----------------

const listReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, targetType } = req.query;
    const data = await service.listReports({ page, limit, status, targetType });
    return success(res, 200, 'Reports fetched successfully', data);
  } catch (err) { next(err); }
};
const getReportDetails = async (req, res, next) => {
  try {
    const data = await service.getReportDetails(req.params.id);
    return success(res, 200, 'Report details fetched successfully', data);
  } catch (err) { next(err); }
};
const updateReportStatus = async (req, res, next) => {
  try {
    const data = await service.updateReportStatus(
      req.params.id, req.body.status, req.body.adminNote, req.body.suspendReportedUser // ADDED param
    );
    return success(res, 200, 'Report updated successfully', data);
  } catch (err) { next(err); }
};

// ---------------- ADMIN MANAGEMENT ----------------

const listAdmins = async (req, res, next) => {
  try {
    const data = await service.listAdmins();
    return success(res, 200, 'Admins fetched successfully', data);
  } catch (err) { next(err); }
};
const createAdmin = async (req, res, next) => {
  try {
    const admin = await service.createAdmin(req.body);
    return success(res, 201, 'Admin created successfully', {
      id: admin.id, fullName: admin.fullName, email: admin.email, isSuperAdmin: admin.isSuperAdmin,
    });
  } catch (err) { next(err); }
};

// ---------------- OPPORTUNITY INVITES ----------------
 
const listInviteCandidates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const data = await service.listInviteCandidates(req.params.id, { page, limit, search });
    return success(res, 200, 'Invite candidates fetched successfully', data);
  } catch (err) { next(err); }
};
 
const inviteSeeker = async (req, res, next) => {
  try {
    const invite = await service.inviteSeekerToOpportunity(req.params.id, req.body.seekerId, req.admin.id);
    return success(res, 200, 'Invitation email sent successfully', invite);
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard,
  listSeekers, listGivers, getUserDetails, updateUserStatus, reviewCertificate,
  listOpportunities, getOpportunityDetails, closeOpportunity, deleteOpportunity,
  listDisabilityTypes, createDisabilityType, updateDisabilityType, deleteDisabilityType,
  listCategories, createCategory, updateCategory, deleteCategory,
  listReports, getReportDetails, updateReportStatus,
  listAdmins, createAdmin,
  listInviteCandidates, inviteSeeker,
};
