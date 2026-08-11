const { success } = require('../../utils/apiResponse');
const service = require('./support.service');

// ---------------- USER ----------------

const submitSupportMessage = async (req, res, next) => {
  try {
    const message = await service.submitSupportMessage(req.user.id, req.body);
    return success(res, 201, 'Your message has been submitted. Our support team will get back to you.', message);
  } catch (err) { next(err); }
};

const listMySupportMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await service.listMySupportMessages(req.user.id, { page, limit });
    return success(res, 200, 'Support messages fetched successfully', data);
  } catch (err) { next(err); }
};

// ---------------- ADMIN ----------------

const listSupportMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const data = await service.listSupportMessages({ page, limit, status, category });
    return success(res, 200, 'Support messages fetched successfully', data);
  } catch (err) { next(err); }
};

const getSupportMessageDetails = async (req, res, next) => {
  try {
    const message = await service.getSupportMessageDetails(req.params.id);
    return success(res, 200, 'Support message fetched successfully', message);
  } catch (err) { next(err); }
};

const updateSupportMessageStatus = async (req, res, next) => {
  try {
    const message = await service.updateSupportMessageStatus(req.params.id, req.body.status);
    return success(res, 200, 'Support message updated successfully', message);
  } catch (err) { next(err); }
};

module.exports = {
  submitSupportMessage,
  listMySupportMessages,
  listSupportMessages,
  getSupportMessageDetails,
  updateSupportMessageStatus,
};
