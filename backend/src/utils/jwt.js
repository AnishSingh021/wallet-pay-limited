const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

const generateAccessToken = (payload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};