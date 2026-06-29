/**
 * src/services/authService.js
 * Business logic xác thực
 */
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const userRepo = require('../repositories/userRepository');
const patRepo  = require('../repositories/patientRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../helpers/tokenHelper');
const { sendMail, templates } = require('../helpers/emailHelper');

const SALT_ROUNDS = 10;

const makePayload = (user) => ({
  id:       user.id,
  email:    user.email,
  roleId:   user.roleId,
  roleName: user.roleName,
});

const register = async ({ fullName, email, password, phone }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    const err = new Error('Email đã được sử dụng');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user   = await userRepo.create({ fullName, email, password: hashed, phone, roleId: 3 });

  // Tạo patient profile
  await patRepo.create(user.id);

  const payload = { ...makePayload(user), roleName: 'patient' };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await userRepo.updateRefreshToken(user.id, refreshToken);

  const { password: _, ...safeUser } = user;
  return { user: { ...safeUser, roleName: 'patient' }, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.isActive) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }

  await userRepo.updateLastLogin(user.id);
  const payload = makePayload(user);
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await userRepo.updateRefreshToken(user.id, refreshToken);

  const { password: _, refreshToken: __, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refreshToken = async (token) => {
  if (!token) {
    const err = new Error('Refresh token không được cung cấp');
    err.statusCode = 401;
    throw err;
  }
  const decoded = verifyRefreshToken(token);
  const user    = await userRepo.findByRefreshToken(token);
  if (!user || user.id !== decoded.id) {
    const err = new Error('Refresh token không hợp lệ');
    err.statusCode = 401;
    throw err;
  }

  const payload      = makePayload(user);
  const accessToken  = generateAccessToken(payload);
  const newRefresh   = generateRefreshToken(payload);
  await userRepo.updateRefreshToken(user.id, newRefresh);
  return { accessToken, refreshToken: newRefresh };
};

const logout = async (userId) => {
  await userRepo.updateRefreshToken(userId, null);
};

const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) return; // Không tiết lộ email có tồn tại không

  const token  = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 giờ
  await userRepo.setResetToken(user.id, token, expiry);

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/reset-password.html?token=${token}`;
  const { subject, html } = templates.resetPassword(user.fullName, resetUrl);
  await sendMail({ to: email, subject, html });
};

const resetPassword = async (token, newPassword) => {
  const user = await userRepo.findByResetToken(token);
  if (!user) {
    const err = new Error('Token không hợp lệ hoặc đã hết hạn');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updatePassword(user.id, hashed);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userRepo.findById(userId);
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Mật khẩu hiện tại không đúng');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updatePassword(userId, hashed);
};

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { statusCode: 404 });
  const { password, refreshToken, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, changePassword, getProfile };
