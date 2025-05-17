const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.config');

const verifyToken = async (req, res, next) => {
  try {
    console.log('[verifyToken] Authorization header:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('[verifyToken] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[verifyToken] Decoded token:', decoded);
    } catch (err) {
      console.log('[verifyToken] Token verification error:', err);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (!users.length) {
      console.log('[verifyToken] User not found for id:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    req.user = users[0];
    next();
  } catch (error) {
    console.log('[verifyToken] General error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
}; 