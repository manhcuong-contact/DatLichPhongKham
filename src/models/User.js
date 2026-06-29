const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String },
  roleName: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  refreshToken: { type: String },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
