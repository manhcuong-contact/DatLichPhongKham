/**
 * src/routes/specialtyRoutes.js
 */
const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const specialtyValidator = require('../validators/specialtyValidator');
const { authenticate, adminOnly } = require('../middlewares/auth');
const { uploadSpecialty, handleUploadError } = require('../middlewares/upload');

// Public
router.get('/', specialtyController.getAll);
router.get('/:id', specialtyController.getById);

// Admin only
router.use(authenticate, adminOnly);
router.get('/stats/all', specialtyController.getStats);
router.post('/', uploadSpecialty.single('image'), handleUploadError, specialtyValidator.createOrUpdate, specialtyController.create);
router.put('/:id', uploadSpecialty.single('image'), handleUploadError, specialtyValidator.createOrUpdate, specialtyController.update);
router.delete('/:id', specialtyController.remove);

module.exports = router;
