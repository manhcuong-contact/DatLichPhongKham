/**
 * src/helpers/emailHelper.js
 * Nodemailer email sending helper
 */
const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.MAIL_USER || process.env.MAIL_USER === 'your_email@gmail.com') {
      logger.warn(`[Email] Chưa cấu hình email - Giả lập gửi tới: ${to}`);
      logger.info(`[Email] Subject: ${subject}`);
      return { messageId: 'mock-' + Date.now() };
    }
    const info = await getTransporter().sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'MediFlow'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`,
      to, subject, html, text,
    });
    logger.info(`[Email] Đã gửi tới ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`[Email] Lỗi gửi email: ${err.message}`);
    throw err;
  }
};

// Templates
const templates = {
  appointmentConfirmation: (appt) => ({
    subject: `[MediFlow] Xác nhận lịch hẹn #${appt.confirmationCode}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:20px;">
        <div style="background:#2563EB;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;">🏥 MediFlow</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;">Hệ thống đặt lịch khám sức khỏe</p>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e3a5f;">✅ Đặt lịch thành công!</h2>
          <p>Xin chào <strong>${appt.patientName}</strong>,</p>
          <p>Lịch hẹn của bạn đã được đặt thành công. Mã xác nhận: <strong style="color:#2563EB;">${appt.confirmationCode}</strong></p>
          <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px;color:#666;">📅 Ngày khám:</td><td style="padding:6px;font-weight:600;">${appt.appointmentDate}</td></tr>
              <tr><td style="padding:6px;color:#666;">⏰ Giờ khám:</td><td style="padding:6px;font-weight:600;">${appt.startTime} - ${appt.endTime}</td></tr>
              <tr><td style="padding:6px;color:#666;">👨‍⚕️ Bác sĩ:</td><td style="padding:6px;font-weight:600;">${appt.doctorName}</td></tr>
              <tr><td style="padding:6px;color:#666;">🏥 Phòng khám:</td><td style="padding:6px;font-weight:600;">${appt.clinicName}</td></tr>
              <tr><td style="padding:6px;color:#666;">📍 Địa chỉ:</td><td style="padding:6px;">${appt.clinicAddress}</td></tr>
              <tr><td style="padding:6px;color:#666;">🩺 Chuyên khoa:</td><td style="padding:6px;">${appt.specialtyName}</td></tr>
              <tr><td style="padding:6px;color:#666;">💰 Phí khám:</td><td style="padding:6px;font-weight:600;">${Number(appt.consultationFee).toLocaleString('vi-VN')} đ</td></tr>
            </table>
          </div>
          <p style="color:#dc2626;font-size:13px;">⚠️ Vui lòng đến trước giờ hẹn 15 phút và mang theo CCCD/CMND.</p>
          <p style="color:#666;font-size:12px;">Nếu cần hủy lịch, vui lòng liên hệ ít nhất 2 giờ trước giờ hẹn.</p>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:12px;">© 2026 MediFlow Healthcare. All rights reserved.</p>
      </div>
    `,
  }),

  appointmentReminder: (appt) => ({
    subject: `[MediFlow] Nhắc lịch khám hôm nay - ${appt.startTime}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2563EB;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;">🔔 Nhắc Lịch Khám</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
          <p>Xin chào <strong>${appt.patientName}</strong>,</p>
          <p>Bạn có lịch khám <strong>HÔM NAY</strong> lúc <strong style="color:#2563EB;">${appt.startTime}</strong>:</p>
          <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:20px 0;">
            <p><strong>👨‍⚕️ ${appt.doctorName}</strong> - ${appt.specialtyName}</p>
            <p>🏥 ${appt.clinicName}</p>
            <p>📍 ${appt.clinicAddress}</p>
          </div>
          <p style="color:#dc2626;">⚠️ Vui lòng đến đúng giờ và mang theo CCCD/CMND.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: '[MediFlow] Yêu cầu đặt lại mật khẩu',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2563EB;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;">🔑 Đặt Lại Mật Khẩu</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#2563EB;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">Đặt Lại Mật Khẩu</a>
          </div>
          <p style="color:#666;font-size:13px;">Link này có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendMail, templates };
