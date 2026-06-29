/**
 * src/middlewares/errorHandler.js
 * Global error handler
 */
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  if (err.stack) logger.debug(err.stack);

  const statusCode = err.statusCode || err.status || 500;
  const message    = statusCode === 500 ? 'Lỗi server nội bộ' : err.message;

  res.status(statusCode).json({ success: false, message });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} không tồn tại` });
};

module.exports = { errorHandler, notFoundHandler };
