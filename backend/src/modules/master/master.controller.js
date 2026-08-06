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

module.exports = { listDisabilityTypes, listCategories };
