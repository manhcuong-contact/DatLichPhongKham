/**
 * src/controllers/reviewController.js
 */
const reviewService = require('../services/reviewService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getByDoctor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await reviewService.getByDoctor(req.params.doctorId, page, limit);
    return R.paginated(res, data.data, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages }, 'Lấy danh sách đánh giá thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = await reviewService.create(req.user.id, req.body);
    return R.created(res, data, 'Gửi đánh giá thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

module.exports = { getByDoctor, create };
