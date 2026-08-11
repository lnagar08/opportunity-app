const { success } = require('../../utils/apiResponse');
const service = require('./report.service');

const createReport = async (req, res, next) => {
  try {
    const report = await service.createReport(req.user.id, req.body);
    return success(res, 201, 'Report submitted. Our team will review it shortly.', report);
  } catch (err) { next(err); }
};

const listMyReports = async (req, res, next) => {
  try {
    const reports = await service.listMyReports(req.user.id);
    return success(res, 200, 'Reports fetched successfully', reports);
  } catch (err) { next(err); }
};

module.exports = { createReport, listMyReports };