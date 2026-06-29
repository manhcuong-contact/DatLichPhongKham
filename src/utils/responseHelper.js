/**
 * src/utils/responseHelper.js
 * Chuẩn hoá response REST API
 */

const mapId = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    obj.forEach(mapId);
  } else if (typeof obj === 'object' && obj.constructor === Object) {
    if (obj._id !== undefined && obj.id === undefined) {
      obj.id = obj._id.toString();
    }
    Object.values(obj).forEach(mapId);
  }
  return obj;
};

const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data: mapId(data) });
};

const created = (res, data = null, message = 'Tạo thành công') => {
  return res.status(201).json({ success: true, message, data: mapId(data) });
};

const paginated = (res, data, pagination, message = 'Thành công') => {
  return res.status(200).json({ success: true, message, data: mapId(data), pagination });
};

const error = (res, message = 'Lỗi server', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = 'Không tìm thấy') => error(res, message, 404);
const badRequest = (res, message = 'Dữ liệu không hợp lệ', errors = null) => error(res, message, 400, errors);
const unauthorized = (res, message = 'Chưa xác thực') => error(res, message, 401);
const forbidden = (res, message = 'Không có quyền') => error(res, message, 403);
const conflict = (res, message = 'Dữ liệu đã tồn tại') => error(res, message, 409);

module.exports = { success, created, paginated, error, notFound, badRequest, unauthorized, forbidden, conflict };
