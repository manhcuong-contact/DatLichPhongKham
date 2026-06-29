/**
 * src/services/appointmentService.js
 */
const appointmentRepo = require('../repositories/appointmentRepository');
const patientRepo     = require('../repositories/patientRepository');
const doctorRepo      = require('../repositories/doctorRepository');
const { sendMail, templates } = require('../helpers/emailHelper');

const getAll = async (params) => {
  return appointmentRepo.getAll(params);
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

  // Check conflict
  const isConflict = await appointmentRepo.checkConflict(doctor._id, data.appointmentDate, data.startTime, data.endTime);
  if (isConflict) throw Object.assign(new Error('Khung giờ này đã có người đặt'), { statusCode: 409 });

  const appointmentData = {
    patientId:       userId,
    doctorId:        doctor.userId ? (doctor.userId._id || doctor.userId) : doctor._id,
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
    const templates = require('../utils/emailTemplates');
    const { sendMail } = require('../utils/mailer');
    const appointmentFull = await appointmentRepo.findById(newApt._id);
    if (appointmentFull && patient.email) {
      const emailData = templates.appointmentConfirmation(appointmentFull);
      await sendMail({ to: patient.email, ...emailData });
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
