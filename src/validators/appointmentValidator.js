/**
 * src/validators/appointmentValidator.js
 */
const { body } = require('express-validator');

const book = [
  body('doctorId').isInt().withMessage('Mã bác sĩ không hợp lệ'),
  body('appointmentDate').isISO8601().withMessage('Ngày hẹn không hợp lệ'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu phải định dạng HH:MM'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc phải định dạng HH:MM'),
  body('symptoms').optional().trim().escape(),
];

const updateStatus = [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
  body('note').optional().trim().escape(),
  body('cancelReason').optional().trim().escape(),
  body('diagnosis').optional().trim().escape(),
  body('prescription').optional().trim().escape(),
];

module.exports = { book, updateStatus };
