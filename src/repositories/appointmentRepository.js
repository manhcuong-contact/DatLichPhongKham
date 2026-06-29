const { Appointment, Doctor, User, Clinic } = require('../models');

const findAll = async (filters = {}) => {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.status) query.status = filters.status;
  if (filters.clinicId) query.clinicId = filters.clinicId;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Appointment.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const data = await Appointment.find(query)
    .populate('patientId', 'fullName email phone')
    .populate('doctorId', 'fullName')
    .populate('clinicId', 'name address')
    .sort({ appointmentDate: -1, startTime: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Attach specialtyName
  const doctorIds = data.map(d => d.doctorId?._id).filter(Boolean);
  const doctors = await Doctor.find({ userId: { $in: doctorIds } }).populate('specialtyId', 'name').lean();
  const doctorMap = {};
  doctors.forEach(doc => { doctorMap[doc.userId.toString()] = doc; });

  data.forEach(d => {
    if (d.doctorId && doctorMap[d.doctorId._id.toString()]) {
      const doc = doctorMap[d.doctorId._id.toString()];
      d.specialtyName = doc.specialtyId?.name || '';
    }
  });
    
  return { data, page, limit, total, totalPages };
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

const getAvailableSlots = async (doctorId, date) => {
  // Define default slots (e.g., 08:00 to 17:00, 30 min each)
  const defaultSlots = [
    { startTime: '08:00', endTime: '08:30' },
    { startTime: '08:30', endTime: '09:00' },
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '09:30', endTime: '10:00' },
    { startTime: '10:00', endTime: '10:30' },
    { startTime: '10:30', endTime: '11:00' },
    { startTime: '11:00', endTime: '11:30' },
    { startTime: '11:30', endTime: '12:00' },
    { startTime: '13:00', endTime: '13:30' },
    { startTime: '13:30', endTime: '14:00' },
    { startTime: '14:00', endTime: '14:30' },
    { startTime: '14:30', endTime: '15:00' },
    { startTime: '15:00', endTime: '15:30' },
    { startTime: '15:30', endTime: '16:00' },
    { startTime: '16:00', endTime: '16:30' },
    { startTime: '16:30', endTime: '17:00' }
  ];

  const start = new Date(date);
  start.setHours(0,0,0,0);
  const end = new Date(date);
  end.setHours(23,59,59,999);
  
  const existingApts = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).lean();

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Lấy giờ hiện tại theo múi giờ Việt Nam (UTC+7)
  const vnTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  
  // Parse ngày khách chọn
  const [year, month, day] = date.split('-').map(Number);
  
  const isToday = (vnTime.getFullYear() === year && vnTime.getMonth() + 1 === month && vnTime.getDate() === day);
  const currentMinutes = vnTime.getHours() * 60 + vnTime.getMinutes();

  return defaultSlots.filter(slot => {
    const slotStartMin = toMinutes(slot.startTime);
    const slotEndMin = toMinutes(slot.endTime);

    // Filter out past slots if the date is today
    if (isToday && slotStartMin <= currentMinutes) {
      return false;
    }

    // Filter out slots that conflict with existing appointments
    for (const apt of existingApts) {
      const extStart = toMinutes(apt.startTime);
      const extEnd = toMinutes(apt.endTime);
      if (slotStartMin < extEnd && slotEndMin > extStart) {
        return false;
      }
    }

    return true;
  });
};

module.exports = {
  findAll,
  findById,
  create,
  updateStatus,
  getStats,
  checkConflict,
  getAvailableSlots
};
