/**
 * src/services/clinicService.js
 */
const clinicRepo = require('../repositories/clinicRepository');
const haversine  = require('../utils/haversine');

const getAll = async (params) => {
  return clinicRepo.findAll(params);
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
  return clinicRepo.findNearby(userLat, userLng, radiusKm);
};

module.exports = { getAll, getById, create, update, remove, getNearby };
