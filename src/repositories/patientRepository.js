const { Patient, User } = require('../models');

const findByUserId = async (userId) => {
  return Patient.findOne({ userId }).populate('userId').lean();
};

const create = async (data) => {
  const p = new Patient(data);
  return p.save();
};

const updateByUserId = async (userId, data) => {
  return Patient.findOneAndUpdate({ userId }, { $set: data }, { new: true }).lean();
};

const getMedicalHistory = async (patientId) => {
  // Wait, MedicalHistory repo will handle this usually, but if it's here:
  const { MedicalHistory } = require('../models');
  return MedicalHistory.find({ patientId }).populate('doctorId appointmentId').sort({ createdAt: -1 }).lean();
};

module.exports = {
  findByUserId,
  create,
  updateByUserId,
  getMedicalHistory
};
