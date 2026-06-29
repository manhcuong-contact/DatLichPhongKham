/**
 * src/services/doctorService.js
 */
const bcrypt = require('bcryptjs');
const userRepo   = require('../repositories/userRepository');
const doctorRepo = require('../repositories/doctorRepository');

const getAll = async (params) => {
  return doctorRepo.getAll(params);
};

const getById = async (id) => {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw Object.assign(new Error('Không tìm thấy bác sĩ'), { statusCode: 404 });
  return doctor;
};

const getBySpecialty = async (specialtyId) => {
  return doctorRepo.findBySpecialty(specialtyId);
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
    password: hashed,
    phone:    data.phone,
    roleId:   2 // Doctor
  });

  // 2. Create Doctor
  const doctor = await doctorRepo.create(user.id, {
    specialtyId:     data.specialtyId,
    clinicId:        data.clinicId,
    licenseNumber:   data.licenseNumber,
    degree:          data.degree,
    experience:      data.experience,
    bio:             data.bio,
    consultationFee: data.consultationFee,
  });

  return { userId: user.id, doctorId: doctor.id };
};

const update = async (doctorId, data) => {
  const doctor = await doctorRepo.findById(doctorId);
  if (!doctor) throw Object.assign(new Error('Không tìm thấy bác sĩ'), { statusCode: 404 });

  // Update profile
  await userRepo.updateProfile(doctor.userId, {
    fullName:  data.fullName  || doctor.fullName,
    phone:     data.phone     || doctor.phone,
    avatarUrl: data.avatarUrl || doctor.avatarUrl,
  });

  if (data.isActive !== undefined) {
    await userRepo.updateStatus(doctor.userId, data.isActive);
  }

  // Update Doctor details
  await doctorRepo.update(doctorId, {
    specialtyId:     data.specialtyId     || doctor.specialtyId,
    clinicId:        data.clinicId        || doctor.clinicId,
    licenseNumber:   data.licenseNumber   || doctor.licenseNumber,
    degree:          data.degree          || doctor.degree,
    experience:      data.experience      || doctor.experience,
    bio:             data.bio             || doctor.bio,
    consultationFee: data.consultationFee || doctor.consultationFee,
    isActive:        data.isActive        !== undefined ? data.isActive : doctor.isActive,
  });
};

const getSchedules = async (doctorId) => {
  return doctorRepo.getSchedules(doctorId);
};

const upsertSchedule = async (doctorId, schedules) => {
  if (!Array.isArray(schedules)) throw Object.assign(new Error('Schedules phải là mảng'), { statusCode: 400 });
  for (const s of schedules) {
    await doctorRepo.upsertSchedule(doctorId, s);
  }
};

const deleteSchedule = async (doctorId, scheduleId) => {
  await doctorRepo.deleteSchedule(doctorId, scheduleId);
};

module.exports = { getAll, getById, getBySpecialty, create, update, getSchedules, upsertSchedule, deleteSchedule };
