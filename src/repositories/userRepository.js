const { User } = require('../models');

const findByEmail = async (email) => {
  return User.findOne({ email }).lean();
};

const findById = async (id) => {
  return User.findById(id).lean();
};

const create = async (userData) => {
  const user = new User(userData);
  return user.save();
};

const updateProfile = async (id, data) => {
  return User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
};

const updatePassword = async (id, newPasswordHash) => {
  return User.findByIdAndUpdate(id, { passwordHash: newPasswordHash }).lean();
};

const saveResetToken = async (id, token, expiry) => {
  return User.findByIdAndUpdate(id, { resetToken: token, resetTokenExpiry: expiry }).lean();
};

const findByResetToken = async (token) => {
  return User.findOne({ resetToken: token }).lean();
};

const clearResetToken = async (id) => {
  return User.findByIdAndUpdate(id, { $unset: { resetToken: 1, resetTokenExpiry: 1 } }).lean();
};

const verifyEmail = async (id) => {
  return User.findByIdAndUpdate(id, { isEmailVerified: true }).lean();
};

module.exports = {
  findByEmail,
  findById,
  create,
  updateProfile,
  updatePassword,
  saveResetToken,
  findByResetToken,
  clearResetToken,
  verifyEmail
};
