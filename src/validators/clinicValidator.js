/**
 * src/validators/clinicValidator.js
 */
const { body } = require('express-validator');

const createOrUpdate = [
  body('name').notEmpty().withMessage('Tên phòng khám không được để trống').trim(),
  body('address').notEmpty().withMessage('Địa chỉ không được để trống').trim(),
  body('city').optional().trim(),
  body('phone').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ không hợp lệ'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Kinh độ không hợp lệ'),
  body('openTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ mở cửa phải định dạng HH:MM'),
  body('closeTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ đóng cửa phải định dạng HH:MM'),
];

module.exports = { createOrUpdate };
