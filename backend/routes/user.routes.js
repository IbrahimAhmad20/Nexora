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
      const [profiles] = await pool.query(`
        SELECT * FROM users WHERE id = ?
      `, [req.user.id]);

      if (profiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found'
        });
      }

      const profile = profiles[0];

      // Fetch user stats (example - you'll need to implement this query)
      const [[stats]] = await pool.query(
          `SELECT
             (SELECT COUNT(*) FROM orders WHERE customer_id = ?) AS totalOrders,
             (SELECT COUNT(*) FROM wishlist WHERE user_id = ?) AS wishlistItems,
             (SELECT COUNT(*) FROM orders WHERE customer_id = ? AND status = 'pending') AS pendingOrders,
             (SELECT COUNT(*) FROM reviews WHERE customer_id = ?) AS reviewsGiven
           `,
           [req.user.id, req.user.id, req.user.id, req.user.id]
      );

      res.json({
        success: true,
        data: { ...profile, stats: stats || {} }
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
    body('phone').optional().matches(/^[+\\d\\s-]{10,}$/).withMessage('Invalid phone number'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { first_name, last_name, phone, password } = req.body;
      const updateFields = [];
      const updateValues = [];

      if (first_name !== undefined) {
        updateFields.push('first_name = ?');
        updateValues.push(first_name);
      }
      if (last_name !== undefined) {
        updateFields.push('last_name = ?');
        updateValues.push(last_name);
      }
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }
      if (updateFields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }
      updateValues.push(req.user.id);
      await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
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
  (req, res, next) => {
    console.log('[admin-users route] hit');
    next();
  },
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

// Get user's wishlist
router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, 
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [req.user.id]);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
});

// Add after other profile routes
router.post('/save-card', verifyToken, async (req, res) => {
  try {
    const { card_number, card_expiry, card_cvc, card_name } = req.body;
    // In production, NEVER store raw card data! Use a payment gateway/tokenization.
    // For demo, we'll just store last 4 digits and expiry.
    if (!card_number || !card_expiry || !card_cvc || !card_name) {
      return res.status(400).json({ success: false, message: 'Incomplete card info.' });
    }
    const last4 = card_number.slice(-4);
    await pool.query(
      'UPDATE users SET credit_card = ?, credit_card_expiry = ?, credit_card_name = ? WHERE id = ?',
      [last4, card_expiry, card_name, req.user.id]
    );
    res.json({ success: true, message: 'Card saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save card.' });
  }
});

// Add to wishlist
router.post('/:id/wishlist', verifyToken, checkRole(['customer']),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = req.user.id;

      // Check if product exists
      const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
      if (products.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // Check if already in wishlist
      const [wishlistItem] = await pool.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);

      if (wishlistItem.length > 0) {
        return res.status(409).json({ success: false, message: 'Product already in wishlist.' });
      }

      // Add to wishlist
      await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);

      res.json({ success: true, message: 'Product added to wishlist.' });

    } catch (err) {
      console.error('Error adding to wishlist:', err);
      res.status(500).json({ success: false, message: 'Failed to add to wishlist.' });
    }
  }
);

// Remove from wishlist
router.delete('/:id/wishlist', verifyToken, checkRole(['customer']),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = req.user.id;

      const [result] = await pool.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Product not found in wishlist.' });
      }

      res.json({ success: true, message: 'Product removed from wishlist.' });

    } catch (err) {
      console.error('Error removing from wishlist:', err);
      res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
    }
  }
);

// Get user addresses
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const [addresses] = await pool.query(
      'SELECT id, user_id, label, address, city, state, zip, country FROM addresses WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ success: false, message: 'Error fetching user addresses' });
  }
});

// Add new address
router.post('/addresses',
  verifyToken,
  [
    body('label').notEmpty().withMessage('Label is required'),
    body('address').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zip').notEmpty().withMessage('Zip code is required'),
    body('country').notEmpty().withMessage('Country is required'),

  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { label, address, city, state, zip, country } = req.body;

    

      const [result] = await pool.query(
        'INSERT INTO addresses (user_id, label, address, city, state, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, label, address, city, state, zip, country]
      );

      res.status(201).json({ success: true, message: 'Address added successfully', addressId: result.insertId });
    } catch (error) {
      console.error('Error adding user address:', error);
      // Log the specific database error for debugging
      console.error('Database error details:', error.message, error.sql, error.sqlState);
      res.status(500).json({ success: false, message: 'Error adding user address' });
    }
  }
);

// Update address
router.put('/addresses/:id',
  verifyToken,
  [
    body('label').optional().notEmpty().withMessage('Label cannot be empty'),
    body('address').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('city').optional().notEmpty().withMessage('City cannot be empty'),
    body('state').optional().notEmpty().withMessage('State cannot be empty'),
    body('zip').optional().notEmpty().withMessage('Zip code cannot be empty'),
    body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { label, address, city, state, zip, country} = req.body;

      // Check if address belongs to the user
      const [addresses] = await pool.query(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (addresses.length === 0) {
        return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
      }

      const updateFields = [];
      const updateValues = [];

      if (label !== undefined) { updateFields.push('label = ?'); updateValues.push(label); }
      if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address); }
      if (city !== undefined) { updateFields.push('city = ?'); updateValues.push(city); }
      if (state !== undefined) { updateFields.push('state = ?'); updateValues.push(state); }
      if (zip !== undefined) { updateFields.push('zip = ?'); updateValues.push(zip); }
      if (country !== undefined) { updateFields.push('country = ?'); updateValues.push(country); }
     
      if (updateFields.length === 0) {
         return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      updateValues.push(id);
      await pool.query(
        `UPDATE addresses SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      res.json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
      console.error('Error updating user address:', error);
      res.status(500).json({ success: false, message: 'Error updating user address' });
    }
  }
);

// Delete address
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to the user and delete
    const [result] = await pool.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting user address:', error);
    res.status(500).json({ success: false, message: 'Error deleting user address' });
  }
});

// Assuming a separate endpoint for notification preferences
router.put('/notification-preferences',
  verifyToken,
  async (req, res) => {
    try {
      // Note: You'll need to add actual logic to save preferences to the database
      const { order_updates, promotions, price_drop_alerts, new_arrivals, method } = req.body;

      // Basic validation (expand as needed)
      if (typeof order_updates !== 'boolean' || typeof promotions !== 'boolean' || typeof price_drop_alerts !== 'boolean' || typeof new_arrivals !== 'boolean' || !['email', 'sms', 'both'].includes(method)) {
          return res.status(400).json({ success: false, message: 'Invalid notification preferences data.' });
      }

      // Example SQL to update user table (assuming columns exist: order_updates, promotions, price_drop_alerts, new_arrivals, notification_method)
      await pool.query(
        'UPDATE users SET order_updates = ?, promotions = ?, price_drop_alerts = ?, new_arrivals = ?, notification_method = ? WHERE id = ?',
        [order_updates, promotions, price_drop_alerts, new_arrivals, method, req.user.id]
      );

      console.log('Notification preferences received and updated:', req.body);
      res.json({ success: true, message: 'Notification preferences updated successfully.' });

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ success: false, message: 'Error updating notification preferences' });
    }
  }
);

// 2FA routes (keep these paths as they are mounted under /api/auth in server.js)
// ... existing code ...

module.exports = router; 