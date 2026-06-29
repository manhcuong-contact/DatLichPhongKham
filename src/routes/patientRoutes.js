/**
 * src/routes/patientRoutes.js
 */
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const patientValidator = require('../validators/patientValidator');
const { authenticate, adminOnly } = require('../middlewares/auth');

// All patient routes require auth
router.use(authenticate);

// Profile (for the patient themselves)
router.get('/me', patientController.getMyProfile);
router.put('/me', patientValidator.updateProfile, patientController.updateProfile);

// Admin only
router.get('/', adminOnly, patientController.getAll);
router.get('/:id', adminOnly, patientController.getById);
router.put('/:id', adminOnly, patientValidator.updateProfile, patientController.updateProfile);

module.exports = router;
