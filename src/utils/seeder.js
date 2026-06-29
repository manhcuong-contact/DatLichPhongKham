require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const { User, Clinic, Specialty, Doctor, Patient } = require('../models');
const logger = require('./logger');

const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const dem = ['Văn', 'Thị', 'Ngọc', 'Minh', 'Đức', 'Hữu', 'Phương', 'Thu', 'Thanh', 'Bích', 'Hải', 'Xuân', 'Đình', 'Quang', 'Bảo', 'Kim'];
const ten = ['Anh', 'Tuấn', 'Dũng', 'Linh', 'Trang', 'Hùng', 'Hương', 'Hải', 'Yến', 'Long', 'Sơn', 'Bình', 'Cường', 'Thảo', 'Nga', 'Thành', 'Đạt', 'Khoa', 'Huy', 'Tâm', 'Nam', 'Việt', 'Mai', 'Lan', 'Hoa', 'Phúc', 'Lộc', 'Thọ', 'Khang'];

const getRandomName = () => {
  return `BS. ${ho[Math.floor(Math.random() * ho.length)]} ${dem[Math.floor(Math.random() * dem.length)]} ${ten[Math.floor(Math.random() * ten.length)]}`;
};

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
    const adminPass = await bcrypt.hash('Admin@123456', 10);
    await User.create({
      fullName: 'Administrator',
      email: 'admin@mediflow.com',
      passwordHash: adminPass,
      phone: '0987654321',
      roleName: 'admin',
      isEmailVerified: true
    });
    
    logger.info('Seeding Clinics...');
    const clinicsData = [
      { name: 'Phòng khám Đa khoa Thu Cúc', address: '286 Thụy Khuê, Tây Hồ', city: 'Hà Nội', latitude: 21.0427, longitude: 105.8166 },
      { name: 'Phòng khám Đa khoa Medlatec', address: '42 Nghĩa Dũng, Ba Đình', city: 'Hà Nội', latitude: 21.0450, longitude: 105.8458 },
      { name: 'Phòng khám Đa khoa Hồng Ngọc', address: '55 Yên Ninh, Ba Đình', city: 'Hà Nội', latitude: 21.0416, longitude: 105.8415 },
      { name: 'Phòng khám Đa khoa Vinmec', address: '458 Minh Khai, Hai Bà Trưng', city: 'Hà Nội', latitude: 20.9959, longitude: 105.8679 },
      { name: 'Phòng khám Đa khoa Việt Pháp', address: '1 Phương Mai, Đống Đa', city: 'Hà Nội', latitude: 21.0061, longitude: 105.8392 }
    ];
    const clinics = await Clinic.insertMany(clinicsData);
    
    logger.info('Seeding Specialties...');
    const specsData = [
      { name: 'Nội khoa', description: 'Khám và điều trị các bệnh nội khoa cơ bản' },
      { name: 'Nhi khoa', description: 'Khám và điều trị các bệnh cho trẻ sơ sinh và trẻ nhỏ' },
      { name: 'Tai Mũi Họng', description: 'Khám và nội soi Tai Mũi Họng' },
      { name: 'Răng Hàm Mặt', description: 'Chăm sóc sức khỏe răng miệng' },
      { name: 'Mắt', description: 'Khám các bệnh lý về mắt' }
    ];
    const specialties = await Specialty.insertMany(specsData);
    
    logger.info('Seeding 75 Doctors (5 Clinics x 5 Specialties x 3 Doctors)...');
    const docPass = await bcrypt.hash('doctor123', 10);
    const titles = ['Bác sĩ CK I', 'Bác sĩ CK II', 'Thạc sĩ, Bác sĩ', 'Tiến sĩ, Bác sĩ', 'Bác sĩ Đa khoa'];
    const prices = [200000, 300000, 400000, 500000];
    
    let docCounter = 1;
    for (const clinic of clinics) {
      for (const spec of specialties) {
        for (let i = 0; i < 3; i++) {
          const docName = getRandomName();
          const u = await User.create({
            fullName: docName,
            email: `doctor${docCounter}@mediflow.com`,
            passwordHash: docPass,
            phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
            roleName: 'doctor',
            isEmailVerified: true
          });
          
          await Doctor.create({
            userId: u._id,
            clinicId: clinic._id,
            specialtyId: spec._id,
            title: titles[Math.floor(Math.random() * titles.length)],
            price: prices[Math.floor(Math.random() * prices.length)],
            experience: Math.floor(Math.random() * 20) + 3 // 3-22 yrs
          });
          docCounter++;
        }
      }
    }
    
    logger.info('Seeding Patient...');
    const patPass = await bcrypt.hash('Admin@123456', 10);
    const u3 = await User.create({ fullName: 'Bệnh Nhân Test', email: 'patient1@mediflow.com', passwordHash: patPass, roleName: 'patient', isEmailVerified: true });
    await Patient.create({ userId: u3._id });

    logger.info('✅ Seeding completed!');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
