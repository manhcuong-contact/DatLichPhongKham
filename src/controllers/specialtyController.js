/**
 * src/controllers/specialtyController.js
 */
const specialtyService = require('../services/specialtyService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true' || req.user?.roleName === 'patient';
    const data = await specialtyService.getAll(activeOnly);
    return R.success(res, data, 'Lấy danh sách chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await specialtyService.getById(req.params.id);
    return R.success(res, data, 'Lấy chi tiết chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/specialties/${req.file.filename}`;
    const result = await specialtyService.create(data);
    return R.created(res, result, 'Tạo chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const update = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/specialties/${req.file.filename}`;
    await specialtyService.update(req.params.id, data);
    return R.success(res, null, 'Cập nhật chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const remove = async (req, res) => {
  try {
    await specialtyService.remove(req.params.id);
    return R.success(res, null, 'Xóa chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getStats = async (req, res) => {
  try {
    const data = await specialtyService.getStats();
    return R.success(res, data, 'Lấy thống kê chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { getAll, getById, create, update, remove, getStats };
