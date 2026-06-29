/**
 * src/controllers/patientController.js
 */
const patientService = require('../services/patientService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const params = {
      page:   parseInt(req.query.page) || 1,
      limit:  parseInt(req.query.limit) || 10,
      search: req.query.search || '',
    };
    const data = await patientService.getAll(params);
    return R.paginated(res, data.data, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages }, 'Lấy danh sách bệnh nhân thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await patientService.getById(req.params.id);
    return R.success(res, data, 'Lấy chi tiết bệnh nhân thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getMyProfile = async (req, res) => {
  try {
    const data = await patientService.getByUserId(req.user.id);
    return R.success(res, data, 'Lấy hồ sơ của bạn thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const updateProfile = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Xác định userId cần update: 
    // Nếu là admin đang sửa cho patient khác thì lấy từ body.userId (tuỳ logic, hiện tại assume cho chính họ)
    const userId = req.user.id; 
    
    await patientService.update(userId, data);
    return R.success(res, null, 'Cập nhật hồ sơ bệnh nhân thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

module.exports = { getAll, getById, getMyProfile, updateProfile };
