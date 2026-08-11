const { success } = require('../../utils/apiResponse');
const service = require('./content.service');

const getContentPage = async (req, res, next) => {
  try {
    const page = await service.getContentPage(req.params.slug);
    return success(res, 200, 'Content page fetched successfully', page);
  } catch (err) { next(err); }
};

const listContentPages = async (req, res, next) => {
  try {
    const pages = await service.listContentPages();
    return success(res, 200, 'Content pages fetched successfully', pages);
  } catch (err) { next(err); }
};

const updateContentPage = async (req, res, next) => {
  try {
    const page = await service.updateContentPage(req.params.slug, req.admin.id, req.body);
    return success(res, 200, 'Content page updated successfully', page);
  } catch (err) { next(err); }
};

module.exports = { getContentPage, listContentPages, updateContentPage };
