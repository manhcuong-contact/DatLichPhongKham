/**
 * src/controllers/authController.js
 */
const authService = require('../services/authService');
const R = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = await authService.register(req.body);
    return R.created(res, data, 'Đăng ký tài khoản thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const login = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    const data = await authService.login(req.body);
    return R.success(res, data, 'Đăng nhập thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);
    return R.success(res, data, 'Làm mới token thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 401); }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.id);
    return R.success(res, null, 'Đăng xuất thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    return R.success(res, null, 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi');
  } catch (e) { return R.error(res, e.message, 500); }
};

const resetPassword = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return R.success(res, null, 'Đặt lại mật khẩu thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 400); }
};

const changePassword = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return R.badRequest(res, 'Dữ liệu không hợp lệ', errs.array());
  try {
    await authService.changePassword(req.user.id, req.body);
    return R.success(res, null, 'Đổi mật khẩu thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 400); }
};

const getProfile = async (req, res) => {
  try {
    const data = await authService.getProfile(req.user.id);
    return R.success(res, data, 'Lấy thông tin thành công');
  } catch (e) { return R.error(res, e.message, e.statusCode || 500); }
};

const updateProfile = async (req, res) => {
  try {
    const userRepo = require('../repositories/userRepository');
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    const { fullName, phone } = req.body;
    await userRepo.updateProfile(req.user.id, {
      fullName: fullName || req.user.fullName,
      phone:    phone || null,
      avatarUrl,
    });
    return R.success(res, null, 'Cập nhật thông tin thành công');
  } catch (e) { return R.error(res, e.message, 500); }
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, changePassword, getProfile, updateProfile };
