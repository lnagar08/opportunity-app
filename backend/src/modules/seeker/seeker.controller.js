const { success } = require('../../utils/apiResponse');
const service = require('./seeker.service');
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

// ---------------- PROFILE ----------------

const getMyProfile = async (req, res, next) => {
  try {
    const user = await service.getMyProfile(req.user.id);
    return success(res, 200, 'Profile fetched successfully', user);
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profilePhotoUrl = req.file ? toFileUrl(req, req.file.filename) : undefined;
    const user = await service.updateMyProfile(req.user.id, req.body, profilePhotoUrl);
    return success(res, 200, 'Profile updated successfully', user);
  } catch (err) { next(err); }
};

const completeProfile = async (req, res, next) => {
  try {
    const profilePhotoUrl = req.file ? toFileUrl(req, req.file.filename) : undefined;
    const user = await service.completeProfile(req.user.id, req.body, profilePhotoUrl);
    return success(res, 200, 'Profile completed successfully', user);
  } catch (err) { next(err); }
};

// ---------------- EDUCATION ----------------

const addEducation = async (req, res, next) => {
  try {
    const record = await service.addEducation(req.user.id, req.body);
    return success(res, 201, 'Education added successfully', record);
  } catch (err) { next(err); }
};
const updateEducation = async (req, res, next) => {
  try {
    const record = await service.updateEducation(req.user.id, req.params.id, req.body);
    return success(res, 200, 'Education updated successfully', record);
  } catch (err) { next(err); }
};
const deleteEducation = async (req, res, next) => {
  try {
    await service.deleteEducation(req.user.id, req.params.id);
    return success(res, 200, 'Education deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- EXPERIENCE ----------------

const addExperience = async (req, res, next) => {
  try {
    const record = await service.addExperience(req.user.id, req.body);
    return success(res, 201, 'Experience added successfully', record);
  } catch (err) { next(err); }
};
const updateExperience = async (req, res, next) => {
  try {
    const record = await service.updateExperience(req.user.id, req.params.id, req.body);
    return success(res, 200, 'Experience updated successfully', record);
  } catch (err) { next(err); }
};
const deleteExperience = async (req, res, next) => {
  try {
    await service.deleteExperience(req.user.id, req.params.id);
    return success(res, 200, 'Experience deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- SKILLS ----------------

const addSkill = async (req, res, next) => {
  try {
    const record = await service.addSkill(req.user.id, req.body);
    return success(res, 201, 'Skill added successfully', record);
  } catch (err) { next(err); }
};
const updateSkill = async (req, res, next) => {
  try {
    const record = await service.updateSkill(req.user.id, req.params.id, req.body);
    return success(res, 200, 'Skill updated successfully', record);
  } catch (err) { next(err); }
};
const deleteSkill = async (req, res, next) => {
  try {
    await service.deleteSkill(req.user.id, req.params.id);
    return success(res, 200, 'Skill deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- AWARDS ----------------

const addAward = async (req, res, next) => {
  try {
    const record = await service.addAward(req.user.id, req.body);
    return success(res, 201, 'Award added successfully', record);
  } catch (err) { next(err); }
};
const updateAward = async (req, res, next) => {
  try {
    const record = await service.updateAward(req.user.id, req.params.id, req.body);
    return success(res, 200, 'Award updated successfully', record);
  } catch (err) { next(err); }
};
const deleteAward = async (req, res, next) => {
  try {
    await service.deleteAward(req.user.id, req.params.id);
    return success(res, 200, 'Award deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- CERTIFICATIONS ----------------

const addCertification = async (req, res, next) => {
  try {
    const record = await service.addCertification(req.user.id, req.body);
    return success(res, 201, 'Certification added successfully', record);
  } catch (err) { next(err); }
};
const updateCertification = async (req, res, next) => {
  try {
    const record = await service.updateCertification(req.user.id, req.params.id, req.body);
    return success(res, 200, 'Certification updated successfully', record);
  } catch (err) { next(err); }
};
const deleteCertification = async (req, res, next) => {
  try {
    await service.deleteCertification(req.user.id, req.params.id);
    return success(res, 200, 'Certification deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- PORTFOLIO ----------------

const addPortfolio = async (req, res, next) => {
  try {
    const mediaFiles = (req.files || []).map((file) => mapUploadedFile(req, file));
    const record = await service.addPortfolio(req.user.id, req.body, mediaFiles);
    return success(res, 201, 'Portfolio item added successfully', record);
  } catch (err) { next(err); }
};
const updatePortfolio = async (req, res, next) => {
  try {
    const mediaFiles = (req.files || []).map((file) => mapUploadedFile(req, file));
    const record = await service.updatePortfolio(req.user.id, req.params.id, req.body, mediaFiles);
    return success(res, 200, 'Portfolio item updated successfully', record);
  } catch (err) { next(err); }
};
const deletePortfolio = async (req, res, next) => {
  try {
    await service.deletePortfolio(req.user.id, req.params.id);
    return success(res, 200, 'Portfolio item deleted successfully');
  } catch (err) { next(err); }
};

// ---------------- HOME / SEARCH / DETAILS ----------------

const getHome = async (req, res, next) => {
  try {
    const data = await service.getHome(req.user.id);
    return success(res, 200, 'Home data fetched successfully', data);
  } catch (err) { next(err); }
};

const searchOpportunities = async (req, res, next) => {
  try {
    const data = await service.searchOpportunities(req.query);
    return success(res, 200, 'Opportunities fetched successfully', data);
  } catch (err) { next(err); }
};

const getOpportunityDetails = async (req, res, next) => {
  try {
    const data = await service.getOpportunityDetails(req.user.id, req.params.id);
    return success(res, 200, 'Opportunity details fetched successfully', data);
  } catch (err) { next(err); }
};

// ---------------- APPLY / APPLICATIONS ----------------

const applyToOpportunity = async (req, res, next) => {
  try {
    const mediaFiles = (req.files || []).map((file) => mapUploadedFile(req, file));
    const application = await service.applyToOpportunity(req.user.id, req.params.id, req.body, mediaFiles);
    return success(res, 201, 'Application submitted successfully', application);
  } catch (err) { next(err); }
};

const listMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await service.listMyApplications(req.user.id, { page, limit, status });
    return success(res, 200, 'Applications fetched successfully', data);
  } catch (err) { next(err); }
};

const getApplicationDetails = async (req, res, next) => {
  try {
    const data = await service.getApplicationDetails(req.user.id, req.params.id);
    return success(res, 200, 'Application details fetched successfully', data);
  } catch (err) { next(err); }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const data = await service.withdrawApplication(req.user.id, req.params.id);
    return success(res, 200, 'Application withdrawn successfully', data);
  } catch (err) { next(err); }
};

module.exports = {
  getMyProfile, updateMyProfile, completeProfile,
  addEducation, updateEducation, deleteEducation,
  addExperience, updateExperience, deleteExperience,
  addSkill, updateSkill, deleteSkill,
  addAward, updateAward, deleteAward,
  addCertification, updateCertification, deleteCertification,
  addPortfolio, updatePortfolio, deletePortfolio,
  getHome, searchOpportunities, getOpportunityDetails,
  applyToOpportunity, listMyApplications, getApplicationDetails, withdrawApplication,
};
