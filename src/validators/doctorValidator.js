/**
 * src/validators/doctorValidator.js
 */
const { body } = require('express-validator');

const create = [
  body('fullName').notEmpty().withMessage('Họ tên không được để trống').trim(),
  body('email').isEmail().withMessage('Email không hợp lệ').toLowerCase().trim(),
  body('specialtyId').isMongoId().withMessage('Chuyên khoa không hợp lệ'),
  body('clinicId').isMongoId().withMessage('Phòng khám không hợp lệ'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Phí khám phải lớn hơn hoặc bằng 0'),
];

const update = [
  body('fullName').optional().notEmpty().withMessage('Họ tên không được để trống').trim(),
  body('specialtyId').optional().isMongoId().withMessage('Chuyên khoa không hợp lệ'),
  body('clinicId').optional().isMongoId().withMessage('Phòng khám không hợp lệ'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Phí khám phải lớn hơn hoặc bằng 0'),
];

const schedule = [
  body('schedules').isArray().withMessage('Lịch làm việc phải là một mảng'),
  body('schedules.*.dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Ngày trong tuần từ 1 đến 7'),
  body('schedules.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu phải định dạng HH:MM'),
  body('schedules.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc phải định dạng HH:MM'),
  body('schedules.*.slotDuration').optional().isInt({ min: 5 }).withMessage('Thời lượng mỗi ca khám ít nhất 5 phút'),
];

module.exports = { create, update, schedule };
