/**
 * src/routes/clinicRoutes.js
 */
const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const clinicValidator = require('../validators/clinicValidator');
const { authenticate, adminOnly } = require('../middlewares/auth');
const { uploadClinic, handleUploadError } = require('../middlewares/upload');

// Public
router.get('/', clinicController.getAll);
router.get('/nearby', clinicController.getNearby);
router.get('/:id', clinicController.getById);

// Admin only
router.use(authenticate, adminOnly);
router.post('/', uploadClinic.single('image'), handleUploadError, clinicValidator.createOrUpdate, clinicController.create);
router.put('/:id', uploadClinic.single('image'), handleUploadError, clinicValidator.createOrUpdate, clinicController.update);
router.delete('/:id', clinicController.remove);

module.exports = router;
