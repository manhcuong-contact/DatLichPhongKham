const { Review, Appointment } = require('../models');

const create = async (data) => {
  const r = new Review(data);
  return r.save();
};

const getByDoctorId = async (doctorId) => {
  return Review.find({ doctorId })
    .populate('patientId', 'fullName avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
};

const getByClinicId = async (clinicId) => {
  return Review.find({ clinicId })
    .populate('patientId', 'fullName avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
};

const checkExisting = async (appointmentId) => {
  const r = await Review.findOne({ appointmentId }).lean();
  return !!r;
};

module.exports = {
  create,
  getByDoctorId,
  getByClinicId,
  checkExisting
};
