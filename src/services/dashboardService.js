/**
 * src/services/dashboardService.js
 */
const dashboardRepo = require('../repositories/dashboardRepository');

const getAdminStats = async () => {
  return dashboardRepo.getAdminStats();
};

module.exports = { getAdminStats };
