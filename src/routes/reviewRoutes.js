/**
 * src/routes/reviewRoutes.js
 */
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const reviewValidator = require('../validators/reviewValidator');
const { authenticate, patientOnly } = require('../middlewares/auth');

// Public
router.get('/doctor/:doctorId', reviewController.getByDoctor);

// Patient only
router.post('/', authenticate, patientOnly, reviewValidator.create, reviewController.create);

module.exports = router;
