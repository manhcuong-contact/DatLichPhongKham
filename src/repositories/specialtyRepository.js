const { Specialty } = require('../models');

const findAll = async (filters = {}) => {
  const query = { isActive: true };
  let docs = Specialty.find(query);
  
  if (filters.limit) docs = docs.limit(parseInt(filters.limit));
  
  const results = await docs.lean();
  
  if (filters.search) {
    const s = filters.search.toLowerCase();
    return results.filter(sp => sp.name.toLowerCase().includes(s));
  }
  return results;
};

const findById = async (id) => {
  return Specialty.findById(id).lean();
};

module.exports = {
  findAll,
  findById
};
