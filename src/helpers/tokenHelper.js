/**
 * src/helpers/tokenHelper.js
 * JWT token generation and verification
 */
const jwt = require('jsonwebtoken');

const SECRET        = process.env.JWT_SECRET        || 'mediflow_secret_key_change_in_prod';
const EXPIRES_IN    = process.env.JWT_EXPIRES_IN    || '1d';
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || 'mediflow_refresh_secret';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

const generateAccessToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

const verifyAccessToken = (token) => jwt.verify(token, SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
