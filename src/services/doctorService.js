/**
 * src/services/doctorService.js
 */
const bcrypt = require('bcryptjs');
const userRepo   = require('../repositories/userRepository');
const doctorRepo = require('../repositories/doctorRepository');

const getAll = async (params) => {
  return doctorRepo.findAll(params);
};

const getById = async (id) => {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw Object.assign(new Error('Không tìm thấy bác sĩ'), { statusCode: 404 });
  return doctor;
};

const getBySpecialty = async (specialtyId) => {
  const result = await doctorRepo.findAll({ specialtyId, limit: 100, page: 1 });
  return result.data;
};

const create = async (data) => {
  // Check if email exists
  const existingUser = await userRepo.findByEmail(data.email);
  if (existingUser) throw Object.assign(new Error('Email đã tồn tại'), { statusCode: 409 });

  // 1. Create User
  const password = data.password || 'Doctor@123456';
  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepo.create({
    fullName: data.fullName,
    email:    data.email,
    passwordHash: hashed,
    phone:    data.phone,
    roleName: 'doctor'
  });

  const { Doctor } = require('../models');
  const doctor = await Doctor.create({
    userId:        user.id,
    specialtyId:   data.specialtyId,
    clinicId:      data.clinicId,
    title:         data.degree || 'BS',
    bio:           data.bio,
    experienceYears: data.experience,
    price:         data.consultationFee || 0,
  });

  return { userId: user.id, doctorId: doctor.id };
};

const update = async (doctorId, data) => {
  const doctor = await doctorRepo.findById(doctorId);
  if (!doctor) throw Object.assign(new Error('Không tìm thấy bác sĩ'), { statusCode: 404 });

  const userId = doctor.userId?._id || doctor.userId;

  // Update User profile
  const userUpdateData = {};
  if (data.fullName) userUpdateData.fullName = data.fullName;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;
  if (data.avatarUrl) userUpdateData.avatarUrl = data.avatarUrl;
  if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;
  if (Object.keys(userUpdateData).length > 0) {
    await userRepo.updateProfile(userId, userUpdateData);
  }

  // Update Doctor details
  const { Doctor } = require('../models');
  const doctorUpdateData = {};
  if (data.specialtyId) doctorUpdateData.specialtyId = data.specialtyId;
  if (data.clinicId) doctorUpdateData.clinicId = data.clinicId;
  if (data.bio !== undefined) doctorUpdateData.bio = data.bio;
  if (data.experience !== undefined) doctorUpdateData.experienceYears = data.experience;
  if (data.consultationFee !== undefined) doctorUpdateData.price = data.consultationFee;
  if (data.degree) doctorUpdateData.title = data.degree;
  if (data.isActive !== undefined) doctorUpdateData.isActive = data.isActive;
  if (Object.keys(doctorUpdateData).length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, { $set: doctorUpdateData });
  }
};

const getSchedules = async (doctorId) => {
  // DoctorSchedule model chưa được định nghĩa trong hệ thống hiện tại
  // Returning available slots from appointmentRepo instead
  return [];
};

const upsertSchedule = async (doctorId, schedules) => {
  if (!Array.isArray(schedules)) throw Object.assign(new Error('Schedules phải là mảng'), { statusCode: 400 });
  // Placeholder: DoctorSchedule model chưa được implement
  return { message: 'Chức năng đang được phát triển' };
};

const deleteSchedule = async (doctorId, scheduleId) => {
  // Placeholder: DoctorSchedule model chưa được implement
  return { message: 'Chức năng đang được phát triển' };
};

module.exports = { getAll, getById, getBySpecialty, create, update, getSchedules, upsertSchedule, deleteSchedule };
