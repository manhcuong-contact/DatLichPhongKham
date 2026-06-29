/**
 * src/jobs/reminderJob.js
 * Cronjob gửi email nhắc lịch khám 30 phút trước giờ hẹn (chạy mỗi phút)
 */
const cron = require('node-cron');
const { Appointment } = require('../models');
const logger = require('../utils/logger');
const { sendMail, templates } = require('../helpers/emailHelper');

/**
 * Tìm lịch hẹn sắp tới trong khoảng 29-31 phút nữa (chưa gửi nhắc)
 */
const getUpcomingForReminder = async () => {
  const now = new Date();
  // Tính window 29 - 31 phút sau (tính bằng ms)
  const from = new Date(now.getTime() + 29 * 60 * 1000);
  const to = new Date(now.getTime() + 31 * 60 * 1000);

  // Lấy ngày hiện tại (theo UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Tính giờ:phút window (format HH:MM)
  const pad = n => String(n).padStart(2, '0');
  const fromTime = `${pad(from.getHours())}:${pad(from.getMinutes())}`;
  const toTime = `${pad(to.getHours())}:${pad(to.getMinutes())}`;

  const appointments = await Appointment.find({
    status: { $in: ['confirmed', 'pending'] },
    reminderSent: { $ne: true },
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    startTime: { $gte: fromTime, $lte: toTime },
  })
    .populate('patientId', 'fullName email')
    .populate('doctorId', 'fullName')
    .populate('clinicId', 'name address')
    .lean();

  return appointments;
};

/**
 * Đánh dấu đã gửi nhắc lịch
 */
const markReminderSent = async (id) => {
  await Appointment.findByIdAndUpdate(id, { $set: { reminderSent: true } });
};

/**
 * Khởi động cronjob (chạy mỗi phút)
 */
const scheduleReminders = () => {
  // Chạy mỗi phút để check 30-minute window
  cron.schedule('* * * * *', async () => {
    try {
      const appointments = await getUpcomingForReminder();
      if (appointments.length === 0) return;

      logger.info(`[Cron] Tìm thấy ${appointments.length} lịch hẹn cần nhắc...`);

      for (const appt of appointments) {
        const patientEmail = appt.patientId?.email;
        if (!patientEmail) continue;

        const apptData = {
          patientName: appt.patientId?.fullName || 'Bạn',
          appointmentDate: appt.appointmentDate
            ? new Date(appt.appointmentDate).toLocaleDateString('vi-VN')
            : '',
          startTime: appt.startTime || '',
          endTime: appt.endTime || '',
          doctorName: appt.doctorId?.fullName || '',
          clinicName: appt.clinicId?.name || '',
          clinicAddress: appt.clinicId?.address || '',
        };

        try {
          const tpl = templates.appointmentReminder(apptData);
          await sendMail({ to: patientEmail, ...tpl });
          await markReminderSent(appt._id);
          logger.info(`[Cron] Đã gửi nhắc lịch tới ${patientEmail} (lịch ${appt._id})`);
        } catch (e) {
          logger.error(`[Cron] Lỗi gửi nhắc lịch ${appt._id}: ${e.message}`);
        }
      }
    } catch (err) {
      logger.error(`[Cron] Lỗi cronjob nhắc lịch: ${err.message}`);
    }
  });

  logger.info('✅ Cronjob nhắc lịch 30 phút đã khởi động (chạy mỗi phút)');
};

module.exports = { scheduleReminders };
