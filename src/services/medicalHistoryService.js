/**
 * src/services/medicalHistoryService.js
 */
const historyRepo = require('../repositories/medicalHistoryRepository');

const getByPatient = async (patientId) => {
  return historyRepo.getByPatient(patientId);
};

const getById = async (id) => {
  const data = await historyRepo.getById(id);
  if (!data) throw Object.assign(new Error('Không tìm thấy lịch sử khám'), { statusCode: 404 });
  return data;
};

module.exports = { getByPatient, getById };
