/**
 * src/controllers/appointmentController.js
 */
const appointmentService = require('../services/appointmentService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const params = {
      page:      parseInt(req.query.page) || 1,
      limit:     parseInt(req.query.limit) || 10,
      status:    req.query.status || null,
      dateFrom:  req.query.dateFrom || null,
      dateTo:    req.query.dateTo || null,
      search:    req.query.search || '',
    };

    // Phân quyền dữ liệu
    if (req.user.roleName === 'patient') {
      const patientRepo = require('../repositories/patientRepository');
      const patient = await patientRepo.findByUserId(req.user.id);
      if (patient) params.patientId = patient.id;
      else return R.paginated(res, [], { page: 1, limit: 10, total: 0, totalPages: 0 }, 'Chưa có hồ sơ');
    } else if (req.user.roleName === 'doctor') {
      // Appointment.doctorId là ref đến User, nên filter theo req.user.id
      params.doctorId = req.user.id;
    }

    const data = await appointmentService.getAll(params);
    return R.paginated(res, data.data, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages }, 'Lấy danh sách lịch hẹn thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await appointmentService.getById(req.params.id);
    
    // Kiểm tra quyền truy cập (chỉ cho phép user liên quan hoặc admin)
    if (req.user.roleName === 'patient') {
      const patientRepo = require('../repositories/patientRepository');
      const patient = await patientRepo.findByUserId(req.user.id);
      const dataPatientId = data.patientId?._id?.toString() || data.patientId?.toString();
      if (!patient || req.user.id.toString() !== dataPatientId) return R.forbidden(res);
    } else if (req.user.roleName === 'doctor') {
      const dataDoctorId = data.doctorId?._id?.toString() || data.doctorId?.toString();
      if (req.user.id.toString() !== dataDoctorId) return R.forbidden(res);
    }

    return R.success(res, data, 'Lấy chi tiết lịch hẹn thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const bookAppointment = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    // Luôn lấy userId của người đang login để đặt lịch
    const data = await appointmentService.bookAppointment(req.user.id, req.body);
    return R.created(res, data, 'Đặt lịch hẹn thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const updateStatus = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const { status, note, diagnosis, prescription, cancelReason } = req.body;
    await appointmentService.updateStatus(req.params.id, status, {
      note, diagnosis, prescription, cancelReason, changedBy: req.user.id
    });
    return R.success(res, null, 'Cập nhật trạng thái thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return R.badRequest(res, 'Thiếu doctorId hoặc date');
    const data = await appointmentService.getAvailableSlots(doctorId, date);
    return R.success(res, data, 'Lấy danh sách giờ trống thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getStatusHistory = async (req, res) => {
  try {
    const data = await appointmentService.getStatusHistory(req.params.id);
    return R.success(res, data, 'Lấy lịch sử trạng thái thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { getAll, getById, bookAppointment, updateStatus, getAvailableSlots, getStatusHistory };
