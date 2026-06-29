/**
 * src/controllers/medicalHistoryController.js
 */
const historyService = require('../services/medicalHistoryService');
const R = require('../utils/responseHelper');

const getMyHistory = async (req, res) => {
  try {
    const patientRepo = require('../repositories/patientRepository');
    const patient = await patientRepo.findByUserId(req.user.id);
    if (!patient) return R.error(res, 'Chưa có hồ sơ bệnh nhân', 404);
    
    const data = await historyService.getByPatient(patient.id);
    return R.success(res, data, 'Lấy lịch sử khám bệnh thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getPatientHistory = async (req, res) => {
  try {
    const data = await historyService.getByPatient(req.params.patientId);
    return R.success(res, data, 'Lấy lịch sử khám bệnh thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const getById = async (req, res) => {
  try {
    const data = await historyService.getById(req.params.id);
    // TODO: Verify access
    return R.success(res, data, 'Lấy chi tiết lịch sử khám thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

module.exports = { getMyHistory, getPatientHistory, getById };
