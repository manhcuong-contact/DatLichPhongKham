/**
 * src/validators/specialtyValidator.js
 */
const { body } = require('express-validator');

const createOrUpdate = [
  body('name').notEmpty().withMessage('Tên chuyên khoa không được để trống').trim().escape(),
  body('icon').optional().trim().escape(),
  body('description').optional().trim(),
];

module.exports = { createOrUpdate };
