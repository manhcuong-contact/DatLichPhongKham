/**
 * src/helpers/emailHelper.js
 * Brevo (Sendinblue) transactional email helper
 */
const https = require('https');
const logger = require('../utils/logger');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'MediFlow';
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'noreply@mediflow.vn';

/**
 * Gửi email qua Brevo Transactional API
 */
const sendMail = async ({ to, subject, html, text }) => {
  const body = JSON.stringify({
    sender: { name: MAIL_FROM_NAME, email: MAIL_FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html || `<p>${text || ''}</p>`,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logger.info(`[Email/Brevo] Đã gửi tới ${to} - Status: ${res.statusCode}`);
          try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); }
        } else {
          logger.error(`[Email/Brevo] Lỗi ${res.statusCode}: ${data}`);
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      logger.error(`[Email/Brevo] Request error: ${err.message}`);
      reject(err);
    });

    req.write(body);
    req.end();
  });
};

// ─── Email Templates ───────────────────────────────────────────────────────────

const templates = {
  /** Gửi khi admin/bác sĩ XÁC NHẬN (confirmed) lịch hẹn */
  appointmentConfirmed: (appt) => ({
    subject: `[MediFlow] ✅ Lịch khám của bạn đã được xác nhận`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:20px;">
        <div style="background:linear-gradient(135deg,#2563EB,#1e40af);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🏥 MediFlow</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Hệ thống đặt lịch khám sức khỏe</p>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <h2 style="color:#16a34a;margin-top:0;">✅ Lịch khám đã được xác nhận!</h2>
          <p>Xin chào <strong>${appt.patientName || 'Bạn'}</strong>,</p>
          <p>Lịch hẹn của bạn đã được <strong>xác nhận</strong>. Vui lòng đến đúng giờ!</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px;color:#555;">📅 Ngày khám:</td><td style="padding:6px;font-weight:600;">${appt.appointmentDate || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">⏰ Giờ khám:</td><td style="padding:6px;font-weight:600;">${appt.startTime || ''} - ${appt.endTime || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">👨‍⚕️ Bác sĩ:</td><td style="padding:6px;font-weight:600;">${appt.doctorName || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">🏥 Phòng khám:</td><td style="padding:6px;font-weight:600;">${appt.clinicName || ''}</td></tr>
              ${appt.clinicAddress ? `<tr><td style="padding:6px;color:#555;">📍 Địa chỉ:</td><td style="padding:6px;">${appt.clinicAddress}</td></tr>` : ''}
            </table>
          </div>
          <p style="color:#dc2626;font-size:13px;">⚠️ Vui lòng đến trước giờ hẹn <strong>15 phút</strong> và mang theo <strong>CCCD/CMND</strong>.</p>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:12px;">© 2026 MediFlow Healthcare. All rights reserved.</p>
      </div>
    `,
  }),

  /** Gửi khi bác sĩ đánh dấu KHÁM XONG (completed) */
  appointmentCompleted: (appt) => ({
    subject: `[MediFlow] 🎉 Kết quả khám bệnh của bạn`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:20px;">
        <div style="background:linear-gradient(135deg,#2563EB,#1e40af);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🏥 MediFlow</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <h2 style="color:#2563EB;margin-top:0;">🎉 Buổi khám đã hoàn thành!</h2>
          <p>Xin chào <strong>${appt.patientName || 'Bạn'}</strong>,</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của MediFlow. Dưới đây là kết quả khám bệnh của bạn:</p>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px;color:#555;">📅 Ngày khám:</td><td style="padding:6px;font-weight:600;">${appt.appointmentDate || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">👨‍⚕️ Bác sĩ:</td><td style="padding:6px;font-weight:600;">${appt.doctorName || ''}</td></tr>
              ${appt.diagnosis ? `<tr><td style="padding:6px;color:#555;">🩺 Chẩn đoán:</td><td style="padding:6px;">${appt.diagnosis}</td></tr>` : ''}
              ${appt.prescription ? `<tr><td style="padding:6px;color:#555;">💊 Đơn thuốc:</td><td style="padding:6px;">${appt.prescription}</td></tr>` : ''}
            </table>
          </div>
          <p style="color:#666;font-size:13px;">Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ phòng khám hoặc đặt lịch tái khám.</p>
          <div style="text-align:center;margin:20px 0;">
            <a href="${process.env.CLIENT_URL || 'https://datlichphongkham-production.up.railway.app'}/patient/history.html" 
               style="background:#2563EB;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
              Xem lịch sử khám
            </a>
          </div>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:12px;">© 2026 MediFlow Healthcare. All rights reserved.</p>
      </div>
    `,
  }),

  /** Gửi NHẮC LỊCH 30 phút trước giờ khám */
  appointmentReminder: (appt) => ({
    subject: `[MediFlow] 🔔 Nhắc lịch khám - Còn 30 phút nữa!`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:20px;">
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">⏰ Nhắc Lịch Khám</h1>
          <p style="color:#fef3c7;margin:4px 0 0;font-size:13px;">MediFlow Healthcare</p>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <h2 style="color:#d97706;margin-top:0;">⚠️ Lịch khám của bạn sắp bắt đầu!</h2>
          <p>Xin chào <strong>${appt.patientName || 'Bạn'}</strong>,</p>
          <p>Bạn có <strong style="color:#d97706;">lịch khám bệnh trong vòng 30 phút tới</strong>. Hãy chuẩn bị sẵn sàng!</p>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px;color:#555;">📅 Ngày khám:</td><td style="padding:6px;font-weight:600;">${appt.appointmentDate || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">⏰ Giờ khám:</td><td style="padding:6px;font-weight:600;color:#d97706;font-size:16px;">${appt.startTime || ''} - ${appt.endTime || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">👨‍⚕️ Bác sĩ:</td><td style="padding:6px;font-weight:600;">${appt.doctorName || ''}</td></tr>
              <tr><td style="padding:6px;color:#555;">🏥 Phòng khám:</td><td style="padding:6px;font-weight:600;">${appt.clinicName || ''}</td></tr>
              ${appt.clinicAddress ? `<tr><td style="padding:6px;color:#555;">📍 Địa chỉ:</td><td style="padding:6px;">${appt.clinicAddress}</td></tr>` : ''}
            </table>
          </div>
          <p style="color:#dc2626;font-size:13px;font-weight:600;">⚠️ Nhớ mang theo: CCCD/CMND, thẻ BHYT (nếu có), và sổ khám bệnh.</p>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:12px;">© 2026 MediFlow Healthcare. All rights reserved.</p>
      </div>
    `,
  }),

  /** Gửi xác nhận đặt lịch (legacy, vẫn giữ) */
  appointmentConfirmation: (appt) => ({
    subject: `[MediFlow] Xác nhận đặt lịch hẹn thành công`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:20px;">
        <div style="background:linear-gradient(135deg,#2563EB,#1e40af);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🏥 MediFlow</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e3a5f;">✅ Đặt lịch thành công!</h2>
          <p>Xin chào <strong>${appt.patientName || 'Bạn'}</strong>,</p>
          <p>Lịch hẹn của bạn đã được đặt thành công. Vui lòng chờ xác nhận từ phòng khám.</p>
          <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px;color:#666;">📅 Ngày khám:</td><td style="padding:6px;font-weight:600;">${appt.appointmentDate || ''}</td></tr>
              <tr><td style="padding:6px;color:#666;">⏰ Giờ khám:</td><td style="padding:6px;font-weight:600;">${appt.startTime || ''} - ${appt.endTime || ''}</td></tr>
              <tr><td style="padding:6px;color:#666;">👨‍⚕️ Bác sĩ:</td><td style="padding:6px;font-weight:600;">${appt.doctorName || ''}</td></tr>
              <tr><td style="padding:6px;color:#666;">🏥 Phòng khám:</td><td style="padding:6px;font-weight:600;">${appt.clinicName || ''}</td></tr>
            </table>
          </div>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:12px;">© 2026 MediFlow Healthcare. All rights reserved.</p>
      </div>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: '[MediFlow] Yêu cầu đặt lại mật khẩu',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#2563EB,#1e40af);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
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
