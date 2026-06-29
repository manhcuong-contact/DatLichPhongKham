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

  const result = await appointmentRepo.bookAppointment({
    patientId:       patient.id,
    doctorId:        doctor.doctorId,
    clinicId:        doctor.clinicId,
    specialtyId:     doctor.specialtyId,
    appointmentDate: data.appointmentDate,
    startTime:       data.startTime,
    endTime:         data.endTime,
    symptoms:        data.symptoms,
    fee:             doctor.consultationFee,
  });

  if (result.errorMsg) {
    throw Object.assign(new Error(result.errorMsg), { statusCode: 409 });
  }

  // Gửi email xác nhận
  const appointment = await appointmentRepo.findById(result.newId);
  if (appointment && patient.email) {
    const emailData = templates.appointmentConfirmation(appointment);
    await sendMail({ to: patient.email, ...emailData }).catch(e => console.error('Lỗi gửi email:', e));
  }

  return appointment;
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
