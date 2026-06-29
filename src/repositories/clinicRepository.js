const { Clinic } = require('../models');

const findAll = async (filters = {}) => {
  const query = { isActive: true };
  let docs = Clinic.find(query);
  
  if (filters.limit) docs = docs.limit(parseInt(filters.limit));
  
  const results = await docs.lean();
  
  if (filters.search) {
    const s = filters.search.toLowerCase();
    return results.filter(c => c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s));
  }
  return results;
};

const findById = async (id) => {
  return Clinic.findById(id).lean();
};

const findNearby = async (lat, lng, radiusKm) => {
  // Simple haversine approximation in memory since we don't have geo-index setup yet
  // Or just return all active clinics and let frontend sort/filter. For simplicity:
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
    
    c.distance = dist; // attach distance
    return dist <= radiusKm;
  }).sort((a, b) => a.distance - b.distance);
};

module.exports = {
  findAll,
  findById,
  findNearby
};
