/**
 * server.js
 */
const app = require('./app');
const logger = require('./src/utils/logger');
const { scheduleReminders } = require('./src/jobs/reminderJob');

const PORT = process.env.PORT || 3000;

// Khởi chạy cronjob
scheduleReminders();

app.listen(PORT, () => {
  logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  logger.info(`👉 API: http://localhost:${PORT}/api/`);
});
