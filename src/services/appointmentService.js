/**
 * src/services/appointmentService.js
 */
const appointmentRepo = require('../repositories/appointmentRepository');
const patientRepo     = require('../repositories/patientRepository');
const doctorRepo      = require('../repositories/doctorRepository');
const { sendMail, templates } = require('../helpers/emailHelper');

const getAll = async (params) => {
  return appointmentRepo.findAll(params);
};

const getById = async (id) => {
  const appointment = await appointmentRepo.findById(id);
  if (!appointment) throw Object.assign(new Error('Không tìm thấy lịch hẹn'), { statusCode: 404 });
  return appointment;
};

const bookAppointment = async (userId, data) => {
  // Lấy patientId từ userId
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw Object.assign(new Error('Vui lòng cập nhật hồ sơ bệnh nhân trước khi đặt lịch'), { statusCode: 400 });

  // Lấy thông tin bác sĩ để biết clinicId, specialtyId, fee
  const doctor = await doctorRepo.findById(data.doctorId);
  if (!doctor) throw Object.assign(new Error('Không tìm thấy bác sĩ'), { statusCode: 404 });

  // doctorId trong Appointment ref User, nên dùng doctor.userId
  const doctorUserId = doctor.userId ? (doctor.userId._id || doctor.userId) : doctor._id;

  // Check conflict
  const isConflict = await appointmentRepo.checkConflict(doctorUserId, data.appointmentDate, data.startTime, data.endTime);
  if (isConflict) throw Object.assign(new Error('Khung giờ này đã có người đặt'), { statusCode: 409 });

  const appointmentData = {
    patientId:       userId,
    doctorId:        doctorUserId,
    clinicId:        doctor.clinicId ? (doctor.clinicId._id || doctor.clinicId) : null,
    appointmentDate: data.appointmentDate,
    startTime:       data.startTime,
    endTime:         data.endTime,
    reason:          data.symptoms,
    status:          'pending'
  };

  const newApt = await appointmentRepo.create(appointmentData);

  // Gửi email xác nhận (Optional - if mail is configured)
  try {
    const appointmentFull = await appointmentRepo.findById(newApt._id || newApt.id);
    if (appointmentFull) {
      const patientUser = appointmentFull.patientId;
      if (patientUser && patientUser.email) {
        const { sendMail } = require('../helpers/emailHelper');
        await sendMail({
          to: patientUser.email,
          subject: 'Xác nhận đặt lịch hẹn - MediFlow',
          html: `<p>Xin chào ${patientUser.fullName || ''},<br>Lịch hẹn của bạn vào ngày <strong>${data.appointmentDate}</strong> lúc <strong>${data.startTime}</strong> đã được đặt thành công.</p>`
        });
      }
    }
  } catch(e) {
    console.error('Lỗi gửi email:', e.message);
  }

  return newApt;
};

const updateStatus = async (id, status, extraData) => {
  const appointment = await appointmentRepo.findById(id);
  if (!appointment) throw Object.assign(new Error('Không tìm thấy lịch hẹn'), { statusCode: 404 });

  await appointmentRepo.updateStatus(id, status, extraData);
};

const getAvailableSlots = async (doctorId, date) => {
  return appointmentRepo.getAvailableSlots(doctorId, date);
};

const getStatusHistory = async (id) => {
  return appointmentRepo.getStatusHistory(id);
};

module.exports = { getAll, getById, bookAppointment, updateStatus, getAvailableSlots, getStatusHistory };
