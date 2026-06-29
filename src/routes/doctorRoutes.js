/**
 * src/routes/doctorRoutes.js
 */
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const doctorValidator = require('../validators/doctorValidator');
const { authenticate, adminOnly, adminOrDoctor } = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

// Public
router.get('/', doctorController.getAll);
router.get('/:id', doctorController.getById);
router.get('/specialty/:specialtyId', doctorController.getBySpecialty);
router.get('/:id/schedules', doctorController.getSchedules);

// Doctor only
router.use(authenticate);
router.post('/schedules', adminOrDoctor, doctorValidator.schedule, doctorController.upsertSchedule);
router.delete('/:id/schedules/:scheduleId', adminOrDoctor, doctorController.deleteSchedule);

// Admin only
router.use(adminOnly);
router.post('/', doctorValidator.create, doctorController.create);
router.put('/:id', uploadAvatar.single('avatar'), handleUploadError, doctorValidator.update, doctorController.update);

module.exports = router;
