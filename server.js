/**
 * server.js
 */
const app = require('./app');
const logger = require('./src/utils/logger');
const { scheduleReminders } = require('./src/jobs/reminderJob');

const PORT = process.env.PORT || 3000;

// Khởi chạy cronjob
scheduleReminders();

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server đang chạy tại cổng ${PORT}`);
  logger.info(`👉 API: http://localhost:${PORT}/api/`);
});
