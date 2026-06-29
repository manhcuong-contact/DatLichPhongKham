/**
 * src/controllers/doctorController.js
 */
const doctorService = require('../services/doctorService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const activeOnly = req.user?.roleName === 'patient';
    const params = {
      page:        parseInt(req.query.page) || 1,
      limit:       parseInt(req.query.limit) || 10,
      search:      req.query.search || '',
      specialtyId: req.query.specialtyId ? parseInt(req.query.specialtyId) : null,
      clinicId:    req.query.clinicId ? parseInt(req.query.clinicId) : null,
      activeOnly,
    };
    const data = await doctorService.getAll(params);
    return R.paginated(res, data.data, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages }, 'Lấy danh sách bác sĩ thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await doctorService.getById(req.params.id);
    return R.success(res, data, 'Lấy chi tiết bác sĩ thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getBySpecialty = async (req, res) => {
  try {
    const data = await doctorService.getBySpecialty(req.params.specialtyId);
    return R.success(res, data, 'Lấy danh sách bác sĩ theo chuyên khoa thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const result = await doctorService.create(req.body);
    return R.created(res, result, 'Thêm bác sĩ thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const update = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = { ...req.body };
    if (req.file) data.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true || data.isActive === 1;

    await doctorService.update(req.params.id, data);
    return R.success(res, null, 'Cập nhật bác sĩ thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getSchedules = async (req, res) => {
  try {
    const doctorId = req.user?.roleName === 'doctor' ? req.user.doctorId : req.params.id; // needs adaptation if req.user doesn't have doctorId. Let's assume params.id is used.
    const id = req.params.id;
    const data = await doctorService.getSchedules(id);
    return R.success(res, data, 'Lấy lịch làm việc thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const upsertSchedule = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    await doctorService.upsertSchedule(req.params.id, req.body.schedules);
    return R.success(res, null, 'Cập nhật lịch làm việc thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const deleteSchedule = async (req, res) => {
  try {
    await doctorService.deleteSchedule(req.params.id, req.params.scheduleId);
    return R.success(res, null, 'Xóa lịch làm việc thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { getAll, getById, getBySpecialty, create, update, getSchedules, upsertSchedule, deleteSchedule };
