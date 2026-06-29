/**
 * src/routes/appointmentRoutes.js
 */
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const appointmentValidator = require('../validators/appointmentValidator');
const { authenticate, adminOrDoctor } = require('../middlewares/auth');

router.use(authenticate);

// Public (requires auth)
router.get('/', appointmentController.getAll);
router.get('/slots', appointmentController.getAvailableSlots); // Lấy giờ trống của bác sĩ
router.get('/:id', appointmentController.getById);
router.get('/:id/history', appointmentController.getStatusHistory);

// Bệnh nhân đặt lịch
router.post('/', appointmentValidator.book, appointmentController.bookAppointment);

// Bệnh nhân hủy lịch (chỉ cập nhật status)
router.put('/:id/cancel', appointmentValidator.updateStatus, appointmentController.updateStatus);

// Bác sĩ / Admin cập nhật trạng thái
router.put('/:id/status', adminOrDoctor, appointmentValidator.updateStatus, appointmentController.updateStatus);

module.exports = router;
