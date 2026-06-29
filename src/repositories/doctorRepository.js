const { Doctor, User, Clinic, Specialty } = require('../models');

const findAll = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.specialtyId && filters.specialtyId !== 'null' && filters.specialtyId !== 'NaN') query.specialtyId = filters.specialtyId;
  if (filters.clinicId && filters.clinicId !== 'null' && filters.clinicId !== 'NaN') query.clinicId = filters.clinicId;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  let docs = Doctor.find(query)
    .populate('userId', 'fullName email phone avatarUrl')
    .populate('clinicId', 'name address')
    .populate('specialtyId', 'name');
    
  let results = await docs.lean();

  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(d => 
      (d.userId && d.userId.fullName && d.userId.fullName.toLowerCase().includes(s)) || 
      (d.clinicId && d.clinicId.name && d.clinicId.name.toLowerCase().includes(s))
    );
  }
  
  const total = results.length;
  const paginatedData = results.slice(skip, skip + limit);

  return {
    data: paginatedData,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

const findById = async (id) => {
  return Doctor.findById(id).populate('userId clinicId specialtyId').lean();
};

const findByUserId = async (userId) => {
  return Doctor.findOne({ userId }).populate('clinicId specialtyId').lean();
};

const getSchedule = async (doctorId, date) => {
  const { Appointment } = require('../models');
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return Appointment.find({ doctorId, appointmentDate: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } }).lean();
};

const getReviews = async (doctorId) => {
  const { Review } = require('../models');
  return Review.find({ doctorId }).populate('patientId', 'fullName avatarUrl').sort({ createdAt: -1 }).lean();
};

module.exports = {
  findAll,
  findById,
  findByUserId,
  getSchedule,
  getReviews
};
