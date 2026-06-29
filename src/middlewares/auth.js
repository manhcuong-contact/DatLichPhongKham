/**
 * src/middlewares/auth.js
 * JWT authentication middleware
 */
const { verifyAccessToken } = require('../helpers/tokenHelper');
const { unauthorized, forbidden } = require('../utils/responseHelper');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token không được cung cấp');
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;   // { id, email, roleId, roleName }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return unauthorized(res, 'Token đã hết hạn');
    return unauthorized(res, 'Token không hợp lệ');
  }
};

const authorize = (...roleNames) => (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (!roleNames.includes(req.user.roleName)) {
    return forbidden(res, 'Bạn không có quyền thực hiện thao tác này');
  }
  next();
};

// Shorthand middlewares
const adminOnly   = authorize('admin');
const doctorOnly  = authorize('doctor');
const patientOnly = authorize('patient');
const adminOrDoctor = authorize('admin', 'doctor');

module.exports = { authenticate, authorize, adminOnly, doctorOnly, patientOnly, adminOrDoctor };
