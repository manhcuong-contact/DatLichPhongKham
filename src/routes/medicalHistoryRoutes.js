/**
 * src/routes/medicalHistoryRoutes.js
 */
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/medicalHistoryController');
const { authenticate, patientOnly, adminOrDoctor } = require('../middlewares/auth');

router.use(authenticate);

// Bệnh nhân tự xem
router.get('/me', patientOnly, historyController.getMyHistory);

// Bác sĩ/Admin xem theo patientId
router.get('/patient/:patientId', adminOrDoctor, historyController.getPatientHistory);

// Chi tiết
router.get('/:id', historyController.getById);

module.exports = router;
