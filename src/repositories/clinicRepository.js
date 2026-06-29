const { Clinic } = require('../models');

const findAll = async (filters = {}) => {
  const query = { isActive: true };
  
  if (filters.search) {
    const s = filters.search.trim();
    // Search by name or city (case-insensitive)
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { city: { $regex: s, $options: 'i' } }
    ];
  }
  
  if (filters.city) {
    query.city = { $regex: filters.city, $options: 'i' };
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const total = await Clinic.countDocuments(query);
  const data = await Clinic.find(query).skip(skip).limit(limit).lean();
  
  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

const findById = async (id) => {
  return Clinic.findById(id).lean();
};

const findNearby = async (lat, lng, radiusKm) => {
  const clinics = await Clinic.find({ isActive: true }).lean();
  
  const toRad = (val) => val * Math.PI / 180;
  const R = 6371; // km
  
  return clinics.filter(c => {
    if (!c.latitude || !c.longitude) return false;
    const dLat = toRad(c.latitude - lat);
    const dLng = toRad(c.longitude - lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat)) * Math.cos(toRad(c.latitude)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const cDist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * cDist;
    
    c.distance = dist;
    return dist <= radiusKm;
  }).sort((a, b) => a.distance - b.distance);
};

const create = async (data) => {
  const c = new Clinic(data);
  return c.save();
};

const update = async (id, data) => {
  return Clinic.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
};

const remove = async (id) => {
  return Clinic.findByIdAndUpdate(id, { isActive: false }).lean();
};

module.exports = {
  findAll,
  findById,
  findNearby,
  create,
  update,
  remove
};
