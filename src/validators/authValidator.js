/**
 * src/validators/authValidator.js
 */
const { body } = require('express-validator');

const register = [
  body('fullName').notEmpty().withMessage('Họ tên không được để trống').trim().escape(),
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
];

const login = [
  body('email').notEmpty().withMessage('Email không được để trống'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];

const resetPassword = [
  body('token').notEmpty().withMessage('Token không được để trống'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự'),
];

const changePassword = [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới ít nhất 6 ký tự'),
];

module.exports = { register, login, resetPassword, changePassword };
