/**
 * app.js
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');
const { connectDB } = require('./src/config/database');

const app = express();

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false   // Allow inline scripts in HTML pages
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
}));

// DB connection is now handled in server.js to ensure it connects before listening

// Routes
app.use('/api/auth',         require('./src/routes/authRoutes'));
app.use('/api/specialties',  require('./src/routes/specialtyRoutes'));
app.use('/api/clinics',      require('./src/routes/clinicRoutes'));
app.use('/api/doctors',      require('./src/routes/doctorRoutes'));
app.use('/api/patients',     require('./src/routes/patientRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/medical-history', require('./src/routes/medicalHistoryRoutes'));
app.use('/api/reviews',         require('./src/routes/reviewRoutes'));
app.use('/api/dashboard',       require('./src/routes/dashboardRoutes'));

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
