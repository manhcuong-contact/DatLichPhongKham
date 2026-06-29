/**
 * src/routes/index.js
 * Router tổng hợp
 */

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediFlow API v1',
    endpoints: {
      auth:         '/api/v1/auth',
      patients:     '/api/v1/patients',
      doctors:      '/api/v1/doctors',
      clinics:      '/api/v1/clinics',
      specialties:  '/api/v1/specialties',
      appointments: '/api/v1/appointments',
      dashboard:    '/api/v1/dashboard',
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth',         require('./authRoutes'));
router.use('/patients',     require('./patientRoutes'));
router.use('/doctors',      require('./doctorRoutes'));
router.use('/clinics',      require('./clinicRoutes'));
router.use('/specialties',  require('./specialtyRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/dashboard',    require('./dashboardRoutes'));

module.exports = router;
