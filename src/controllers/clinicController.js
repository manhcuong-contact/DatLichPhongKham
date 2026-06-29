/**
 * src/controllers/clinicController.js
 */
const clinicService = require('../services/clinicService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const activeOnly = req.user?.roleName === 'patient';
    const params = {
      page:       parseInt(req.query.page) || 1,
      limit:      parseInt(req.query.limit) || 20,
      search:     req.query.search || '',
      city:       req.query.city || '',
      activeOnly,
    };
    const data = await clinicService.getAll(params);
    return R.paginated(res, data.data, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages }, 'Lấy danh sách phòng khám thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await clinicService.getById(req.params.id);
    return R.success(res, data, 'Lấy chi tiết phòng khám thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/clinics/${req.file.filename}`;
    const result = await clinicService.create(data);
    return R.created(res, result, 'Tạo phòng khám thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const update = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/clinics/${req.file.filename}`;
    // handle empty active string
    if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true || data.isActive === 1;

    await clinicService.update(req.params.id, data);
    return R.success(res, null, 'Cập nhật phòng khám thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const remove = async (req, res) => {
  try {
    await clinicService.remove(req.params.id);
    return R.success(res, null, 'Xóa (vô hiệu hóa) phòng khám thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getNearby = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10;
    
    if (isNaN(lat) || isNaN(lng)) return R.badRequest(res, 'Toạ độ không hợp lệ');
    
    const data = await clinicService.getNearby(lat, lng, radius);
    return R.success(res, data, 'Lấy danh sách phòng khám gần đây thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { getAll, getById, create, update, remove, getNearby };
