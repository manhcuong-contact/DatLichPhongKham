/**
 * src/controllers/dashboardController.js
 */
const dashboardService = require('../services/dashboardService');
const R = require('../utils/responseHelper');

const getAdminStats = async (req, res) => {
  try {
    const data = await dashboardService.getAdminStats();
    return R.success(res, data, 'Lấy thống kê thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { getAdminStats };
