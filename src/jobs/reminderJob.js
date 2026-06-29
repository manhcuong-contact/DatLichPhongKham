/**
 * src/jobs/reminderJob.js
 */
const cron = require('node-cron');
const appointmentRepo = require('../repositories/appointmentRepository');
const logger = require('../utils/logger');
const { sendMail, templates } = require('../helpers/emailHelper');

// Chạy vào 7h00 sáng mỗi ngày
const scheduleReminders = () => {
  cron.schedule('0 7 * * *', async () => {
    logger.info('🕒 Bắt đầu chạy cronjob nhắc lịch khám...');
    try {
      const appointments = await appointmentRepo.getTodayForReminder();
      
      let count = 0;
      for (const appt of appointments) {
        if (appt.patientEmail) {
          const emailData = templates.appointmentReminder(appt);
          try {
            await sendMail({ to: appt.patientEmail, ...emailData });
            await appointmentRepo.markReminderSent(appt.id);
            count++;
          } catch (e) {
            logger.error(`[Cron] Lỗi gửi email cho lịch hẹn ${appt.id}: ${e.message}`);
          }
        }
      }
      
      logger.info(`✅ Hoàn thành gửi ${count} email nhắc lịch khám cho hôm nay.`);
    } catch (err) {
      logger.error(`❌ Lỗi trong quá trình chạy cronjob nhắc lịch: ${err.message}`);
    }
  });
};

module.exports = { scheduleReminders };
