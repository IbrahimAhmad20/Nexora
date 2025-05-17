const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// Get user profile
router.get('/profile',
  verifyToken,
  async (req, res) => {
    try {
      const [users] = await pool.query(
        'SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile'
      });
    }
  }
);

// Update user profile
router.put('/profile',
  verifyToken,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().matches(/^\+?[\d\s-]{10,}$/).withMessage('Invalid phone number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { first_name, last_name, phone } = req.body;

      // Update user profile
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
        [first_name, last_name, phone, req.user.id]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }
);

// Change password
router.put('/change-password',
  verifyToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { current_password, new_password } = req.body;

      // Get user
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);

      // Update password
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Error changing password'
      });
    }
  }
);

// Admin routes for user management
// Get all users (admin only)
router.get('/admin/users',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const [users] = await pool.query(
        'SELECT id, email, role, first_name, last_name, phone, created_at FROM users ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  }
);

// Update user role (admin only)
router.put('/admin/users/:userId/role',
  verifyToken,
  checkRole(['admin']),
  [
    body('role').isIn(['admin', 'vendor', 'customer']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId } = req.params;
      const { role } = req.body;

      // Update user role
      await pool.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }
  }
);

// Add cart count endpoint
router.get('/cart/count', verifyToken, async (req, res) => {
  try {
    const [[{ count }]] = await pool.query(
      'SELECT SUM(quantity) as count FROM shopping_cart WHERE customer_id = ?',
      [req.user.id]
    );
    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart count' });
  }
});

module.exports = router; 