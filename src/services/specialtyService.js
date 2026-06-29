/**
 * src/services/specialtyService.js
 */
const specialtyRepo = require('../repositories/specialtyRepository');

const getAll = async (activeOnly = false) => {
  return specialtyRepo.getAll(activeOnly);
};

const getById = async (id) => {
  const specialty = await specialtyRepo.findById(id);
  if (!specialty) throw Object.assign(new Error('Không tìm thấy chuyên khoa'), { statusCode: 404 });
  return specialty;
};

const create = async (data) => {
  const existing = await specialtyRepo.findByName(data.name);
  if (existing) throw Object.assign(new Error('Tên chuyên khoa đã tồn tại'), { statusCode: 409 });
  return specialtyRepo.create(data);
};

const update = async (id, data) => {
  const specialty = await specialtyRepo.findById(id);
  if (!specialty) throw Object.assign(new Error('Không tìm thấy chuyên khoa'), { statusCode: 404 });

  if (data.name && data.name !== specialty.name) {
    const existing = await specialtyRepo.findByName(data.name);
    if (existing) throw Object.assign(new Error('Tên chuyên khoa đã tồn tại'), { statusCode: 409 });
  }

  await specialtyRepo.update(id, data);
};

const remove = async (id) => {
  const specialty = await specialtyRepo.findById(id);
  if (!specialty) throw Object.assign(new Error('Không tìm thấy chuyên khoa'), { statusCode: 404 });
  await specialtyRepo.remove(id);
};

const getStats = async () => {
  return specialtyRepo.getStats();
};

module.exports = { getAll, getById, create, update, remove, getStats };
