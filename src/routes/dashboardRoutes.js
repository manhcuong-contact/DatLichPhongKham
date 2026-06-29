/**
 * src/routes/dashboardRoutes.js
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, adminOnly } = require('../middlewares/auth');

router.use(authenticate, adminOnly);

router.get('/admin', dashboardController.getAdminStats);

module.exports = router;
