/**
 * src/services/reviewService.js
 */
const reviewRepo = require('../repositories/reviewRepository');
const appointmentRepo = require('../repositories/appointmentRepository');
const patientRepo = require('../repositories/patientRepository');

const getByDoctor = async (doctorId, page, limit) => {
  return reviewRepo.getByDoctor(doctorId, page, limit);
};

const create = async (userId, data) => {
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw Object.assign(new Error('Chưa có hồ sơ bệnh nhân'), { statusCode: 400 });

  const appointment = await appointmentRepo.findById(data.appointmentId);
  if (!appointment) throw Object.assign(new Error('Không tìm thấy lịch hẹn'), { statusCode: 404 });
  if (appointment.patientId !== patient.id) throw Object.assign(new Error('Bạn không có quyền đánh giá lịch hẹn này'), { statusCode: 403 });
  if (appointment.status !== 'completed') throw Object.assign(new Error('Chỉ được đánh giá lịch hẹn đã hoàn thành'), { statusCode: 400 });

  const existing = await reviewRepo.findByAppointment(data.appointmentId);
  if (existing) throw Object.assign(new Error('Bạn đã đánh giá lịch hẹn này rồi'), { statusCode: 409 });

  return reviewRepo.create({
    appointmentId: data.appointmentId,
    patientId:     patient.id,
    doctorId:      appointment.doctorId, // using original doctorId from appointment
    rating:        data.rating,
    comment:       data.comment,
  });
};

module.exports = { getByDoctor, create };
