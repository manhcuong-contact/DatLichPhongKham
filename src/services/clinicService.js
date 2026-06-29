/**
 * src/services/clinicService.js
 */
const clinicRepo = require('../repositories/clinicRepository');
const haversine  = require('../utils/haversine');

const getAll = async (params) => {
  return clinicRepo.getAll(params);
};

const getById = async (id) => {
  const clinic = await clinicRepo.findById(id);
  if (!clinic) throw Object.assign(new Error('Không tìm thấy phòng khám'), { statusCode: 404 });
  return clinic;
};

const create = async (data) => {
  return clinicRepo.create(data);
};

const update = async (id, data) => {
  const clinic = await clinicRepo.findById(id);
  if (!clinic) throw Object.assign(new Error('Không tìm thấy phòng khám'), { statusCode: 404 });
  await clinicRepo.update(id, data);
};

const remove = async (id) => {
  const clinic = await clinicRepo.findById(id);
  if (!clinic) throw Object.assign(new Error('Không tìm thấy phòng khám'), { statusCode: 404 });
  await clinicRepo.remove(id);
};

const getNearby = async (userLat, userLng, radiusKm = 10) => {
  const clinics = await clinicRepo.getAllWithCoords();
  
  const withDistance = clinics.map(c => {
    const distance = haversine(userLat, userLng, c.latitude, c.longitude);
    return { ...c, distance };
  });

  return withDistance
    .filter(c => c.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = { getAll, getById, create, update, remove, getNearby };
