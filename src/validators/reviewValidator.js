/**
 * src/validators/reviewValidator.js
 */
const { body } = require('express-validator');

const create = [
  body('appointmentId').isInt().withMessage('Mã lịch hẹn không hợp lệ'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Đánh giá phải từ 1 đến 5 sao'),
  body('comment').optional().trim().escape(),
];

module.exports = { create };
