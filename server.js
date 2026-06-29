/**
 * server.js
 */
global.crypto = require('crypto');
const app = require('./app');
const logger = require('./src/utils/logger');
const { scheduleReminders } = require('./src/jobs/reminderJob');

const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Khởi chạy server sau khi kết nối DB thành công
connectDB().then(() => {
  // Khởi chạy cronjob
  scheduleReminders();

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server đang chạy tại cổng ${PORT}`);
    logger.info(`👉 API: http://localhost:${PORT}/api/`);
  });
}).catch(err => {
  logger.error('Failed to start server due to DB connection issue', err);
});
