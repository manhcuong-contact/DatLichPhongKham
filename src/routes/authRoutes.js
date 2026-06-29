/**
 * src/routes/authRoutes.js
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');
const { authenticate } = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

router.post('/register', authValidator.register, authController.register);
router.post('/login', authValidator.login, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authValidator.resetPassword, authController.resetPassword);

router.use(authenticate);
router.get('/me', authController.getProfile);
router.put('/me', uploadAvatar.single('avatar'), handleUploadError, authController.updateProfile);
router.put('/change-password', authValidator.changePassword, authController.changePassword);

module.exports = router;
