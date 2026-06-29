/**
 * src/services/emailService.js
 * Gửi email bằng Nodemailer (Gmail)
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST  || 'smtp.gmail.com',
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

const FROM = `"${process.env.MAIL_FROM_NAME || 'MediFlow'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`;

// ── template helpers ──────────────────────────────────────────
const baseTemplate = (title, body) => `
<!DOCTYPE html><html lang="vi"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:Arial,sans-serif;background:#f4f6f9;margin:0;padding:20px}
  .card{max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1)}
  .header{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:30px;text-align:center}
  .header h1{margin:0;font-size:24px}
  .body{padding:30px}
  .info{background:#f0f7ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:6px;margin:16px 0}
  .info p{margin:6px 0;color:#374151;font-size:15px}
  .badge{display:inline-block;background:#dbeafe;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-weight:600}
  .footer{background:#f9fafb;text-align:center;padding:20px;color:#9ca3af;font-size:13px;border-top:1px solid #e5e7eb}
  .btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px}
</style></head><body>
<div class="card">
  <div class="header"><h1>🏥 MediFlow Healthcare</h1><p style="margin:4px 0;opacity:.9">${title}</p></div>
  <div class="body">${body}</div>
  <div class="footer">© 2025 MediFlow Healthcare · Hệ thống đặt lịch khám sức khỏe online<br>Email này được gửi tự động, vui lòng không reply.</div>
</div></body></html>`;

// ── send functions ────────────────────────────────────────────

/**
 * Gửi email xác nhận đặt lịch thành công
 */
const sendAppointmentConfirmation = async ({ to, patientName, appointment, doctor, clinic, specialty }) => {
  const subject = `✅ Xác nhận lịch hẹn khám - Mã: ${appointment.confirmationCode}`;
  const body = `
    <p>Xin chào <strong>${patientName}</strong>,</p>
    <p>Lịch hẹn khám của bạn đã được xác nhận thành công!</p>
    <div class="info">
      <p>📋 <strong>Mã lịch hẹn:</strong> <span class="badge">${appointment.confirmationCode}</span></p>
      <p>👨‍⚕️ <strong>Bác sĩ:</strong> ${doctor.fullName} — ${doctor.degree || ''}</p>
      <p>🏥 <strong>Chuyên khoa:</strong> ${specialty.name}</p>
      <p>🏨 <strong>Phòng khám:</strong> ${clinic.name}</p>
      <p>📍 <strong>Địa chỉ:</strong> ${clinic.address}</p>
      <p>📅 <strong>Ngày khám:</strong> ${appointment.appointmentDate}</p>
      <p>⏰ <strong>Giờ khám:</strong> ${appointment.startTime} – ${appointment.endTime}</p>
      <p>💊 <strong>Triệu chứng:</strong> ${appointment.symptoms || 'Không có'}</p>
      <p>💰 <strong>Phí khám:</strong> ${Number(appointment.consultationFee).toLocaleString('vi-VN')} VNĐ</p>
    </div>
    <p>⚠️ Vui lòng đến trước <strong>15 phút</strong> để làm thủ tục và mang theo CMND/CCCD.</p>
    <p>Để hủy hoặc đổi lịch, vui lòng liên hệ <strong>${clinic.phone || 'phòng khám'}</strong> trước 24 giờ.</p>`;

  await getTransporter().sendMail({ from: FROM, to, subject, html: baseTemplate('Xác nhận lịch hẹn khám', body) });
  logger.info(`📧 Confirmation email sent → ${to}`);
};

/**
 * Gửi email nhắc lịch trước 24h
 */
const sendAppointmentReminder = async ({ to, patientName, appointment, doctor, clinic }) => {
  const subject = `⏰ Nhắc lịch khám ngày mai - ${appointment.appointmentDate}`;
  const body = `
    <p>Xin chào <strong>${patientName}</strong>,</p>
    <p>Đây là email nhắc nhở lịch hẹn khám của bạn vào <strong>ngày mai</strong>:</p>
    <div class="info">
      <p>📋 <strong>Mã lịch hẹn:</strong> <span class="badge">${appointment.confirmationCode || appointment.id}</span></p>
      <p>👨‍⚕️ <strong>Bác sĩ:</strong> ${doctor.fullName}</p>
      <p>🏨 <strong>Phòng khám:</strong> ${clinic.name}</p>
      <p>📍 <strong>Địa chỉ:</strong> ${clinic.address}</p>
      <p>📅 <strong>Ngày:</strong> ${appointment.appointmentDate}</p>
      <p>⏰ <strong>Giờ:</strong> ${appointment.startTime} – ${appointment.endTime}</p>
    </div>
    <p>Hãy nhớ chuẩn bị <strong>CMND/CCCD, thẻ BHYT</strong> (nếu có) và đến đúng giờ.</p>
    <p>Chúc bạn khỏe mạnh! 💪</p>`;

  await getTransporter().sendMail({ from: FROM, to, subject, html: baseTemplate('Nhắc lịch khám ngày mai', body) });
  logger.info(`📧 Reminder email sent → ${to}`);
};

/**
 * Gửi email hủy lịch
 */
const sendAppointmentCancellation = async ({ to, patientName, appointment, reason }) => {
  const subject = `❌ Lịch hẹn đã bị hủy - Mã: ${appointment.confirmationCode || appointment.id}`;
  const body = `
    <p>Xin chào <strong>${patientName}</strong>,</p>
    <p>Lịch hẹn khám của bạn đã bị hủy.</p>
    <div class="info">
      <p>📋 <strong>Mã lịch hẹn:</strong> ${appointment.confirmationCode || appointment.id}</p>
      <p>📅 <strong>Ngày dự kiến:</strong> ${appointment.appointmentDate} — ${appointment.startTime}</p>
      <p>❓ <strong>Lý do hủy:</strong> ${reason || 'Không có lý do'}</p>
    </div>
    <p>Nếu bạn muốn đặt lại lịch, hãy truy cập hệ thống MediFlow.</p>`;

  await getTransporter().sendMail({ from: FROM, to, subject, html: baseTemplate('Lịch hẹn đã bị hủy', body) });
  logger.info(`📧 Cancellation email sent → ${to}`);
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
};
