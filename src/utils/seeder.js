require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const { User, Clinic, Specialty, Doctor, Patient } = require('../models');
const logger = require('./logger');

const seedDB = async () => {
  try {
    await connectDB();
    
    logger.info('Clearing old data...');
    await User.deleteMany({});
    await Clinic.deleteMany({});
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    
    logger.info('Seeding Admin...');
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({
      fullName: 'Administrator',
      email: 'admin@mediflow.vn',
      passwordHash: adminPass,
      phone: '0987654321',
      roleName: 'admin',
      isEmailVerified: true
    });
    
    logger.info('Seeding Clinics...');
    const c1 = await Clinic.create({ name: 'Phòng khám Đa khoa Quốc tế', address: '123 Nguyễn Văn Linh', city: 'Hà Nội', latitude: 21.0285, longitude: 105.8542 });
    const c2 = await Clinic.create({ name: 'Phòng khám Tim mạch Tâm Anh', address: '456 Lê Lợi', city: 'TP.HCM', latitude: 10.8231, longitude: 106.6297 });
    
    logger.info('Seeding Specialties...');
    const s1 = await Specialty.create({ name: 'Nội khoa', description: 'Khám các bệnh nội khoa cơ bản' });
    const s2 = await Specialty.create({ name: 'Tim mạch', description: 'Chuyên sâu bệnh lý tim mạch' });
    
    logger.info('Seeding Doctors...');
    const docPass = await bcrypt.hash('doctor123', 10);
    const u1 = await User.create({ fullName: 'Dr. Trần Văn A', email: 'doctorA@mediflow.vn', passwordHash: docPass, roleName: 'doctor' });
    await Doctor.create({ userId: u1._id, clinicId: c1._id, specialtyId: s1._id, title: 'Bác sĩ CK I', price: 300000 });
    
    const u2 = await User.create({ fullName: 'Dr. Nguyễn Thị B', email: 'doctorB@mediflow.vn', passwordHash: docPass, roleName: 'doctor' });
    await Doctor.create({ userId: u2._id, clinicId: c2._id, specialtyId: s2._id, title: 'Thạc sĩ, Bác sĩ', price: 500000 });
    
    logger.info('✅ Seeding completed!');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
