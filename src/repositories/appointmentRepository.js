const { Appointment, Doctor, User, Clinic } = require('../models');

const findAll = async (filters = {}) => {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.status) query.status = filters.status;
  if (filters.clinicId) query.clinicId = filters.clinicId;
  
  let docs = Appointment.find(query)
    .populate('patientId', 'fullName email phone')
    .populate({
      path: 'doctorId',
      select: 'fullName',
      populate: { path: 'clinicId specialtyId' }
    })
    .populate('clinicId', 'name address')
    .sort({ appointmentDate: -1, startTime: 1 });
    
  if (filters.limit) docs = docs.limit(parseInt(filters.limit));
  
  return docs.lean();
};

const findById = async (id) => {
  return Appointment.findById(id)
    .populate('patientId', 'fullName email phone')
    .populate('doctorId', 'fullName')
    .populate('clinicId', 'name address')
    .lean();
};

const create = async (data) => {
  const apt = new Appointment(data);
  return apt.save();
};

const updateStatus = async (id, status, notes = '') => {
  const updateData = { status };
  if (notes) updateData.notes = notes;
  return Appointment.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
};

const getStats = async (doctorId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [total, pending, completed, today] = await Promise.all([
    Appointment.countDocuments({ doctorId }),
    Appointment.countDocuments({ doctorId, status: 'pending' }),
    Appointment.countDocuments({ doctorId, status: 'completed' }),
    Appointment.countDocuments({ doctorId, appointmentDate: { $gte: startOfDay, $lte: endOfDay } })
  ]);
  
  return { total, pending, completed, today };
};

const checkConflict = async (doctorId, date, startTime, endTime) => {
  const start = new Date(date);
  start.setHours(0,0,0,0);
  const end = new Date(date);
  end.setHours(23,59,59,999);
  
  const existing = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).lean();
  
  // Basic overlap check
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);
  
  for (const apt of existing) {
    const extStart = toMinutes(apt.startTime);
    const extEnd = toMinutes(apt.endTime);
    // overlap condition
    if (reqStart < extEnd && reqEnd > extStart) {
      return true; // Conflict found
    }
  }
  
  return false;
};

module.exports = {
  findAll,
  findById,
  create,
  updateStatus,
  getStats,
  checkConflict
};
