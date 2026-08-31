const { success } = require('../../utils/apiResponse');
const service = require('./master.service');

const listDisabilityTypes = async (req, res, next) => {
  try {
    const data = await service.listDisabilityTypes();
    return success(res, 200, 'Disability Types fetched successfully', data);
  } catch (err) { next(err); }
};

const listCategories = async (req, res, next) => {
  try {
    const data = await service.listCategories();
    return success(res, 200, 'Categories fetched successfully', data);
  } catch (err) { next(err); }
};

const listStates = async (req, res, next) => {
  try {
    const data = await service.listStates();
    return success(res, 200, 'States fetched successfully', data);
  } catch (err) { next(err); }
};

const listCities = async (req, res, next) => {
  try {
    const data = await service.listCities(req.query.stateId);
    return success(res, 200, 'Cities fetched successfully', data);
  } catch (err) { next(err); }
};

module.exports = { listDisabilityTypes, listCategories, listStates, listCities };
