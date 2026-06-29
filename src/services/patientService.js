/**
 * src/services/patientService.js
 */
const patientRepo = require('../repositories/patientRepository');
const userRepo    = require('../repositories/userRepository');

const getAll = async (params) => {
  const { Patient } = require('../models');
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Patient.countDocuments();
  const data = await Patient.find()
    .populate('userId', 'fullName email phone avatarUrl isActive')
    .skip(skip).limit(limit).lean();

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const { Patient } = require('../models');
  const patient = await Patient.findById(id).populate('userId', 'fullName email phone avatarUrl').lean();
  if (!patient) throw Object.assign(new Error('Không tìm thấy bệnh nhân'), { statusCode: 404 });
  return patient;
};

const getByUserId = async (userId) => {
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw Object.assign(new Error('Hồ sơ bệnh nhân không tồn tại'), { statusCode: 404 });
  return patient;
};

const update = async (userId, data) => {
  // Cập nhật thông tin profile của User nếu có
  if (data.fullName || data.phone || data.avatarUrl) {
    const user = await userRepo.findById(userId);
    await userRepo.updateProfile(userId, {
      fullName:  data.fullName  || user.fullName,
      phone:     data.phone     || user.phone,
      avatarUrl: data.avatarUrl || user.avatarUrl,
    });
  }

  // Cập nhật thông tin chi tiết Patient
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw Object.assign(new Error('Không tìm thấy hồ sơ bệnh nhân'), { statusCode: 404 });

  await patientRepo.updateByUserId(userId, {
    dateOfBirth:      data.dateOfBirth      || patient.dateOfBirth,
    gender:           data.gender           || patient.gender,
    address:          data.address          || patient.address,
    idCard:           data.idCard           || patient.idCard,
    bloodType:        data.bloodType        || patient.bloodType,
    allergies:        data.allergies        || patient.allergies,
    insuranceNumber:  data.insuranceNumber  || patient.insuranceNumber,
    emergencyContact: data.emergencyContact || patient.emergencyContact,
  });
};

module.exports = { getAll, getById, getByUserId, update };
