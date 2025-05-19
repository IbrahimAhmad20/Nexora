const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.config');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const cors = require('cors');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const passport = require('../config/passport');
const { FRONTEND_URL } = require('../config/url.config');

// Register new user
router.post('/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['customer', 'vendor']).withMessage('Invalid role'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, role, first_name, last_name, phone } = req.body;

      // Check if user already exists
      const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await pool.query(
        'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, role, first_name, last_name, phone]
      );

      // If vendor, create vendor profile
      if (role === 'vendor') {
        await pool.query(
          'INSERT INTO vendor_profiles (user_id, business_name, status) VALUES (?, ?, ?)',
          [result.insertId, `${first_name}'s Business`, 'pending']
        );
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: result.insertId, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          two_factor_enabled: !!user.two_factor_enabled
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in'
      });
    }
  }
);

// Verify token
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1] || authHeader;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Toggle two-factor authentication
router.put('/toggle-2fa',
  verifyToken,
  async (req, res) => {
    try {
      const { enable } = req.body;
      
      if (typeof enable !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'The enable parameter must be a boolean'
        });
      }

      // Update the user's 2FA setting
      await pool.query(`
        UPDATE users
        SET two_factor_enabled = ?
        WHERE id = ?
      `, [enable, req.user.id]);

      res.json({
        success: true,
        message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling two-factor authentication'
      });
    }
  }
);

// Get 2FA status
router.get('/2fa-status',
  verifyToken,
  async (req, res) => {
    try {
      // Get the user's 2FA status
      const [users] = await pool.query(`
        SELECT two_factor_enabled
        FROM users
        WHERE id = ?
      `, [req.user.id]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        enabled: !!users[0].two_factor_enabled
      });
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting two-factor authentication status'
      });
    }
  }
);

// Generate TOTP secret and QR code (for any user)
router.post('/2fa/setup', verifyToken, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: 'Nexora Platform' });
  await pool.query('UPDATE users SET totp_secret = ? WHERE id = ?', [secret.base32, req.user.id]);
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ success: true, qr, secret: secret.base32 });
});

// Verify TOTP code during setup
router.post('/2fa/verify-setup', verifyToken, async (req, res) => {
  const { code } = req.body;
  const [[user]] = await pool.query('SELECT totp_secret FROM users WHERE id = ?', [req.user.id]);
  if (!user || !user.totp_secret) return res.status(400).json({ success: false, message: 'No secret set' });

  const verified = speakeasy.totp.verify({
    secret: user.totp_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (verified) {
    await pool.query('UPDATE users SET two_factor_enabled = 1 WHERE id = ?', [req.user.id]);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid code' });
  }
});

// Verify TOTP code during login
router.post('/2fa/verify', async (req, res) => {
  const { userId, code } = req.body;
  const [[user]] = await pool.query('SELECT totp_secret FROM users WHERE id = ?', [userId]);
  if (!user || !user.totp_secret) return res.status(400).json({ success: false, message: 'No secret set' });

  const verified = speakeasy.totp.verify({
    secret: user.totp_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (verified) {
    // Here you should issue a session/JWT or mark 2FA as passed for this session
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid code' });
  }
});

// Disable 2FA (for any user)
router.post('/2fa/disable', verifyToken, async (req, res) => {
  await pool.query('UPDATE users SET two_factor_enabled = 0, totp_secret = NULL WHERE id = ?', [req.user.id]);
  res.json({ success: true });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login.html' }),
  (req, res) => {
    // Issue JWT and redirect to frontend with token and user info
    const token = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const user = encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      first_name: req.user.first_name,
      last_name: req.user.last_name
    }));
    res.redirect(`${FRONTEND_URL}/login.html?token=${token}&user=${user}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login.html' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const user = encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      first_name: req.user.first_name,
      last_name: req.user.last_name
    }));
    res.redirect(`${FRONTEND_URL}/login.html?token=${token}&user=${user}`);
  }
);

module.exports = router; 