const { MedicalHistory } = require('../models');

const create = async (data) => {
  const mh = new MedicalHistory(data);
  return mh.save();
};

const getByPatientId = async (patientId) => {
  return MedicalHistory.find({ patientId })
    .populate('doctorId', 'fullName avatarUrl')
    .populate('appointmentId', 'appointmentDate startTime endTime')
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  create,
  getByPatientId
};
