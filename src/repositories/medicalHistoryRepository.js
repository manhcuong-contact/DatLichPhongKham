const { MedicalHistory } = require('../models');

const create = async (data) => {
  const mh = new MedicalHistory(data);
  return mh.save();
};

// Alias: getByPatient (tên cũ service dùng)
const getByPatient = async (patientId) => {
  const list = await MedicalHistory.find({ patientId })
    .populate('doctorId', 'fullName avatarUrl')
    .populate('appointmentId', 'appointmentDate startTime endTime clinicId specialtyId')
    .sort({ createdAt: -1 })
    .lean();

  // Map fields flat để frontend dùng dễ hơn
  list.forEach(h => {
    h.id = h._id;
    h.doctorName = h.doctorId?.fullName || 'N/A';
    h.visitDate = h.appointmentId?.appointmentDate || h.createdAt;
    h.startTime = h.appointmentId?.startTime || '';
    h.endTime = h.appointmentId?.endTime || '';
  });

  return list;
};

// Alias: getByPatientId (tên mới)
const getByPatientId = getByPatient;

const getById = async (id) => {
  const h = await MedicalHistory.findById(id)
    .populate('doctorId', 'fullName avatarUrl')
    .populate('patientId', 'fullName phone')
    .populate('appointmentId', 'appointmentDate startTime endTime clinicId')
    .lean();

  if (h) {
    h.id = h._id;
    h.doctorName = h.doctorId?.fullName || 'N/A';
    h.patientName = h.patientId?.fullName || 'N/A';
    h.visitDate = h.appointmentId?.appointmentDate || h.createdAt;
  }
  return h;
};

module.exports = {
  create,
  getByPatient,
  getByPatientId,
  getById,
};
