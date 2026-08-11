const { success } = require('../../utils/apiResponse');
const service = require('./giver.service');
const { toFileUrl } = require('../../utils/fileUrl');

const mapUploadedFile = (req, file) => {
  const mimeToType = (mime) => {
    if (mime.startsWith('image/')) return 'IMAGE';
    if (mime.startsWith('audio/')) return 'AUDIO';
    if (mime.startsWith('video/')) return 'VIDEO';
    return 'PDF';
  };
  return {
    type: mimeToType(file.mimetype),
    url: toFileUrl(req, file.filename),
    fileName: file.originalname,
    sizeBytes: file.size,
  };
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await service.getMyProfile(req.user.id);
    return success(res, 200, 'Profile fetched successfully', user);
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profilePhotoUrl = req.file ? toFileUrl(req, req.file.filename) : undefined;
    const user = await service.updateMyProfile(req.user.id, req.body, profilePhotoUrl);
    return success(res, 200, 'Profile updated successfully', user);
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard(req.user.id);
    return success(res, 200, 'Dashboard fetched successfully', data);
  } catch (err) {
    next(err);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      categoryIds: Array.isArray(req.body.categoryIds)
        ? req.body.categoryIds
        : JSON.parse(req.body.categoryIds || '[]'),
    };
    const mediaFiles = (req.files || []).map((file) => mapUploadedFile(req, file));
    const opportunity = await service.createOpportunity(req.user.id, payload, mediaFiles);
    return success(res, 201, 'Opportunity published successfully', opportunity);
  } catch (err) {
    next(err);
  }
};

const updateOpportunity = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.categoryIds && !Array.isArray(payload.categoryIds)) {
      payload.categoryIds = JSON.parse(payload.categoryIds);
    }
    const opportunity = await service.updateOpportunity(req.user.id, req.params.id, payload);
    return success(res, 200, 'Opportunity updated successfully', opportunity);
  } catch (err) {
    next(err);
  }
};

const listMyOpportunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await service.listMyOpportunities(req.user.id, { page, limit, status });
    return success(res, 200, 'Opportunities fetched successfully', data);
  } catch (err) {
    next(err);
  }
};

const getOpportunityDetails = async (req, res, next) => {
  try {
    const opportunity = await service.getOpportunityDetails(req.user.id, req.params.id);
    return success(res, 200, 'Opportunity details fetched successfully', opportunity);
  } catch (err) {
    next(err);
  }
};

const closeOpportunity = async (req, res, next) => {
  try {
    const opportunity = await service.closeOpportunity(req.user.id, req.params.id);
    return success(res, 200, 'Opportunity closed successfully', opportunity);
  } catch (err) {
    next(err);
  }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    await service.deleteOpportunity(req.user.id, req.params.id);
    return success(res, 200, 'Opportunity deleted successfully');
  } catch (err) {
    next(err);
  }
};

const listApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await service.listApplicationsForOpportunity(
      req.user.id, req.params.opportunityId, { page, limit }
    );
    return success(res, 200, 'Applications fetched successfully', data);
  } catch (err) {
    next(err);
  }
};

const getApplicantProfile = async (req, res, next) => {
  try {
    const application = await service.getApplicantProfile(req.user.id, req.params.applicationId);
    return success(res, 200, 'Applicant profile fetched successfully', application);
  } catch (err) {
    next(err);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await service.updateApplicationStatus(
      req.user.id, req.params.applicationId, req.body.status
    );
    return success(res, 200, 'Application status updated successfully', application);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getDashboard,
  createOpportunity,
  updateOpportunity,
  listMyOpportunities,
  getOpportunityDetails,
  closeOpportunity,
  deleteOpportunity,
  listApplications,
  getApplicantProfile,
  updateApplicationStatus,
};
