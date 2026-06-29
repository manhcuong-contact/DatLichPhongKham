/**
 * src/validators/patientValidator.js
 */
const { body } = require('express-validator');

const updateProfile = [
  body('fullName').optional().notEmpty().withMessage('Họ tên không được để trống').trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Ngày sinh không hợp lệ'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('idCard').optional().trim(),
];

module.exports = { updateProfile };
