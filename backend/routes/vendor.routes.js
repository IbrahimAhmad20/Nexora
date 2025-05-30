const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { logoUpload, productUpload } = require('../utils/upload');
const { Parser } = require('json2csv');
const { BASE_URL } = require('../config/url.config');
const { uploadFileToS3, deleteFileFromS3 } = require('../services/s3Service');

router.use((req, res, next) => {
  console.log('Vendor route hit:', req.method, req.originalUrl);
  next();
});

// Get vendor profile
router.get('/profile',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const [profiles] = await pool.query(`
        SELECT vp.*, u.email, u.first_name, u.last_name, u.phone
        FROM vendor_profiles vp
        JOIN users u ON vp.user_id = u.id
        WHERE vp.user_id = ?
      `, [req.user.id]);

      if (profiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }

      res.json({
        success: true,
        data: profiles[0]
      });
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor profile'
      });
    }
  }
);

// Update vendor profile
router.put('/profile',
  verifyToken,
  checkRole(['vendor']),
  [
    body('business_name').notEmpty().withMessage('Business name is required'),
    body('business_description').optional(),
    body('address').notEmpty().withMessage('Address is required'),
    body('tax_id').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { business_name, business_description, address, tax_id } = req.body;

      // Update vendor profile
      await pool.query(`
        UPDATE vendor_profiles
        SET business_name = ?, business_description = ?, address = ?, tax_id = ?
        WHERE user_id = ?
      `, [business_name, business_description, address, tax_id, req.user.id]);

      res.json({
        success: true,
        message: 'Vendor profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vendor profile'
      });
    }
  }
);

// Get vendor's products
router.get('/products',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      // Pagination (optional)
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      // Support category filtering
      const category = req.query.category;
      const search = req.query.search;
      
      let productsQuery = `
        SELECT p.*,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE vp.user_id = ?
      `;
      let productsParams = [req.user.id];

      // Add filtering by category name (as currently implemented)
      if (category) {
        productsQuery += ' AND c.name = ?'; // Filter by category name
        productsParams.push(category);
      }

      if (search) {
        productsQuery += ' AND p.name LIKE ?';
        productsParams.push(`%${search}%`);
      }

      productsQuery += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      productsParams.push(limit, offset);

      // Get total count for pagination (adjust count query filtering as needed)
      const [[{ count }]] = await pool.query(`
        SELECT COUNT(*) as count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE vp.user_id = ?
        ${category ? ' AND c.name = ?' : ''}
        ${search ? ' AND p.name LIKE ?' : ''}
      `, search ? [req.user.id, category, `%${search}%`] : (category ? [req.user.id, category] : [req.user.id])); // Pass parameters correctly

      const totalPages = Math.max(1, Math.ceil(count / limit));

      // Fetch products
      const [products] = await pool.query(productsQuery, productsParams);

      // No longer need to fetch all images here, as primary_image URL is in the main query
      // and frontend fetches full image list for gallery if needed.

      // Map fields for frontend
      const mappedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category_name, // Use category_name from the join
        category_id: p.category_id, // Include category_id if needed by frontend (e.g., for edit modal)
        price: parseFloat(p.price),
        stock: p.stock_quantity, // Use stock_quantity column
        status: p.stock_quantity === 0 ? 'outofstock' : p.status, // Set status based on stock or DB status
        description: p.description,
        image: p.primary_image
          ? (p.primary_image.startsWith('http') ? p.primary_image : `${BASE_URL}${p.primary_image}`)
          : null,
        images: p.primary_image
          ? [{ url: p.primary_image.startsWith('http') ? p.primary_image : `${BASE_URL}${p.primary_image}`, is_primary: true }]
          : [],
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      res.json({
        products: mappedProducts,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      res.status(500).json({
        message: 'Error fetching vendor products'
      });
    }
  }
);

// Get a single product by ID (for editing)
router.get('/products/:id',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log('User:', req.user.id, 'Product ID:', id);
      // Make sure the product belongs to the vendor
      const [products] = await pool.query(`
        SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE p.id = ? AND vp.user_id = ?
        LIMIT 1
      `, [id, req.user.id]);

      if (products.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const p = products[0];
      // Fetch all images for this product
      const [images] = await pool.query(
        'SELECT image_url, is_primary FROM product_images WHERE product_id = ?',
        [p.id]
      );
      const imageArr = images.map(img => ({
        url: img.image_url.startsWith('http') ? img.image_url : `${BASE_URL}${img.image_url}`,
        is_primary: !!img.is_primary
      }));
      res.json({
        id: p.id,
        name: p.name,
        category: p.category,
        price: parseFloat(p.price),
        stock: p.stock_quantity,
        status: p.stock_quantity === 0 ? 'outofstock' : (p.status === 'deleted' ? 'inactive' : p.status),
        description: p.description,
        image: p.primary_image
          ? (p.primary_image.startsWith('http') ? p.primary_image : `${BASE_URL}${p.primary_image}`)
          : null,
        images: imageArr,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error fetching product' });
    }
  }
);

// Get vendor's orders
router.get('/orders',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      // Get vendor profile id for this user
      const [[vendorProfile]] = await pool.query(
        'SELECT id FROM vendor_profiles WHERE user_id = ?',
        [req.user.id]
      );
      if (!vendorProfile) {
        return res.status(404).json({ success: false, message: 'Vendor profile not found' });
      }
      const vendorProfileId = vendorProfile.id;

      const [orders] = await pool.query(`
        SELECT o.*, oi.*, p.name AS product_name, u.first_name, u.last_name
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON o.customer_id = u.id
        WHERE p.vendor_id = ?
        ORDER BY o.created_at DESC
      `, [vendorProfileId]);
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch vendor orders' });
    }
  }
);

// Export vendor's orders as CSV
router.get('/orders/export',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const search = req.query.search ? req.query.search.trim() : '';
      const status = req.query.status;
      const vendorProfileIdQuery = '(SELECT id FROM vendor_profiles WHERE user_id = ?)' ;
      let baseQuery = `
        SELECT DISTINCT o.*, u.first_name, u.last_name, u.email
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.customer_id = u.id
        WHERE oi.vendor_id = ${vendorProfileIdQuery}
      `;
      let params = [req.user.id];
      if (search) {
        baseQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR o.id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (status) {
        baseQuery += ' AND o.status = ?';
        params.push(status);
      }
      baseQuery += ' ORDER BY o.created_at DESC';
      const [orders] = await pool.query(baseQuery, params);
      // Convert to CSV
      const fields = ['id', 'first_name', 'last_name', 'email', 'total_amount', 'status', 'shipping_address', 'payment_status', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(orders);
      res.header('Content-Type', 'text/csv');
      res.attachment('orders.csv');
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting orders'
      });
    }
  }
);

// Get vendor's order details
router.get('/orders/:orderId',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const { orderId } = req.params;

      // Get order items for this vendor
      const [orderItems] = await pool.query(`
        SELECT oi.*, p.name, p.description,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.vendor_id = (SELECT id FROM vendor_profiles WHERE user_id = ?)
      `, [orderId, req.user.id]);

      if (orderItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or unauthorized'
        });
      }

      // Get order details
      const [orders] = await pool.query(`
        SELECT o.*, u.first_name, u.last_name, u.email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = ?
      `, [orderId]);

      const mappedOrderItems = orderItems.map(item => ({
        ...item,
        image: item.image
          ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`)
          : null
      }));

      res.json({
        success: true,
        data: {
          ...orders[0],
          items: mappedOrderItems
        }
      });
    } catch (error) {
      console.error('Error fetching vendor order details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor order details'
      });
    }
  }
);

// Update order status (vendor)
router.put('/orders/:orderId/status',
  verifyToken,
  checkRole(['vendor']),
  [
    body('status').isIn(['processing', 'shipped', 'delivered']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { orderId } = req.params;
      const { status } = req.body;

      // Check if order exists and belongs to vendor
      const [orderItems] = await pool.query(`
        SELECT oi.* FROM order_items oi
        WHERE oi.order_id = ? AND oi.vendor_id = (SELECT id FROM vendor_profiles WHERE user_id = ?)
      `, [orderId, req.user.id]);

      if (orderItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or unauthorized'
        });
      }

      // Update order status
      await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order status'
      });
    }
  }
);

// Cancel/Delete vendor's order
router.delete('/orders/:orderId',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      // Check if order belongs to vendor
      const [orderItems] = await pool.query(`
        SELECT oi.* FROM order_items oi
        WHERE oi.order_id = ? AND oi.vendor_id = (SELECT id FROM vendor_profiles WHERE user_id = ?)
      `, [orderId, req.user.id]);
      if (orderItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or unauthorized'
        });
      }
      // Set order status to 'canceled'
      await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['canceled', orderId]
      );
      res.json({
        success: true,
        message: 'Order canceled successfully'
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      res.status(500).json({
        success: false,
        message: 'Error canceling order'
      });
    }
  }
);

// Edit vendor's order (shipping address)
router.put('/orders/:orderId',
  verifyToken,
  checkRole(['vendor']),
  [body('shipping_address').notEmpty().withMessage('Shipping address is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { orderId } = req.params;
      const { shipping_address } = req.body;
      // Check if order belongs to vendor
      const [orderItems] = await pool.query(`
        SELECT oi.* FROM order_items oi
        WHERE oi.order_id = ? AND oi.vendor_id = (SELECT id FROM vendor_profiles WHERE user_id = ?)
      `, [orderId, req.user.id]);
      if (orderItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or unauthorized'
        });
      }
      // Update shipping address
      await pool.query(
        'UPDATE orders SET shipping_address = ? WHERE id = ?',
        [shipping_address, orderId]
      );
      res.json({
        success: true,
        message: 'Order updated successfully'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order'
      });
    }
  }
);

// Admin routes for vendor management
// Get all vendors (admin only)
router.get('/admin/vendors',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const [vendors] = await pool.query(`
        SELECT vp.*, u.email, u.first_name, u.last_name, u.phone,
        (SELECT COUNT(*) FROM products WHERE vendor_id = vp.id) as total_products
        FROM vendor_profiles vp
        JOIN users u ON vp.user_id = u.id
        ORDER BY vp.created_at DESC
      `);

      res.json({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendors'
      });
    }
  }
);

// Update vendor status (admin only)
router.put('/admin/vendors/:vendorId/status',
  verifyToken,
  checkRole(['admin']),
  [
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { vendorId } = req.params;
      const { status } = req.body;

      // Update vendor status
      await pool.query(
        'UPDATE vendor_profiles SET status = ? WHERE id = ?',
        [status, vendorId]
      );

      res.json({
        success: true,
        message: 'Vendor status updated successfully'
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vendor status'
      });
    }
  }
);

// Delete vendor (admin only)
router.delete('/admin/vendors/:vendorId',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { vendorId } = req.params;
      const [result] = await pool.query('DELETE FROM vendor_profiles WHERE id = ?', [vendorId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }
      res.json({ success: true, message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ success: false, message: 'Failed to delete vendor' });
    }
  }
);

// Add vendor (admin only)
router.post('/admin/vendors',
  verifyToken,
  checkRole(['admin']),
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('first_name').notEmpty().withMessage('First name required'),
    body('last_name').notEmpty().withMessage('Last name required'),
    body('business_name').notEmpty().withMessage('Business name required'),
    body('password').isLength({ min: 6 }).withMessage('Password required (min 6 chars)')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { email, first_name, last_name, business_name, password } = req.body;
      // Check if user exists
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        if (users[0].role === 'vendor') {
          return res.status(400).json({ success: false, message: 'Vendor already exists for this email' });
        } else {
          return res.status(400).json({ success: false, message: 'User exists but is not a vendor' });
        }
      }
      // Create user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await pool.query(
        'INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, 'vendor', first_name, last_name]
      );
      const userId = userResult.insertId;
      // Create vendor profile
      const [vendorResult] = await pool.query(
        'INSERT INTO vendor_profiles (user_id, business_name, status, created_at) VALUES (?, ?, ?, NOW())',
        [userId, business_name, 'pending']
      );
      res.json({
        success: true,
        vendor: {
          id: vendorResult.insertId,
          email,
          first_name,
          last_name,
          business_name,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Error adding vendor:', error);
      res.status(500).json({ success: false, message: 'Failed to add vendor' });
    }
  }
);

// Middleware to verify vendor
function verifyVendor(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1] || authHeader;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'vendor') return res.status(403).json({ message: 'Not a vendor' });
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

router.get('/dashboard', verifyVendor, async (req, res) => {
    // Get vendor profile ID for this user
    const [[vendorProfile]] = await pool.query(
      'SELECT id FROM vendor_profiles WHERE user_id = ?',
      [req.userId]
    );
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    const vendorProfileId = vendorProfile.id;

    const [[{ products }]] = await pool.query('SELECT COUNT(*) AS products FROM products WHERE vendor_id = ?', [vendorProfileId]);
    const [[{ orders }]] = await pool.query(
      `SELECT COUNT(DISTINCT o.id) AS orders
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.vendor_id = ?`,
      [vendorProfileId]
    );
    const [[{ revenue }]] = await pool.query(
      `SELECT SUM(oi.price_at_time * oi.quantity) AS revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.vendor_id = ?`,
      [vendorProfileId]
    );
    const [[{ averageRating }]] = await pool.query(
      `SELECT AVG(r.rating) AS averageRating
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE p.vendor_id = ?`,
      [vendorProfileId]
    );
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.status, oi.price_at_time * oi.quantity AS total, o.created_at, u.first_name AS customer,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN users u ON o.customer_id = u.id
       WHERE oi.vendor_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [vendorProfileId]
    );

    const mappedRecentOrders = recentOrders.map(order => ({
      ...order,
      image: order.image
        ? (order.image.startsWith('http') ? order.image : `${BASE_URL}${order.image}`)
        : null
    }));

    res.json({
        products,
        orders,
        revenue: revenue || 0,
        averageRating: averageRating ? averageRating.toFixed(1) : 'N/A',
        recentOrders: mappedRecentOrders
    });
});

router.get('/test-vendor', (req, res) => {
  res.json({ message: 'Vendor routes loaded!' });
});

// Store Policies: GET/PUT
router.get('/policies', verifyToken, checkRole(['vendor']), async (req, res) => {
  try {
    const [[profile]] = await pool.query('SELECT shipping_policy, return_policy, privacy_policy FROM vendor_profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching policies' });
  }
});
router.put('/policies', verifyToken, checkRole(['vendor']), async (req, res) => {
  try {
    const { shipping_policy, return_policy, privacy_policy } = req.body;
    await pool.query('UPDATE vendor_profiles SET shipping_policy = ?, return_policy = ?, privacy_policy = ? WHERE user_id = ?', [shipping_policy, return_policy, privacy_policy, req.user.id]);
    res.json({ success: true, message: 'Policies updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating policies' });
  }
});
// Store Availability: GET/PUT
router.get('/availability', verifyToken, checkRole(['vendor']), async (req, res) => {
  try {
    const [[profile]] = await pool.query('SELECT store_status, vacation_message, notify_on_return FROM vendor_profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching availability' });
  }
});
router.put('/availability', verifyToken, checkRole(['vendor']), async (req, res) => {
  try {
    const { store_status, vacation_message, notify_on_return } = req.body;
    await pool.query('UPDATE vendor_profiles SET store_status = ?, vacation_message = ?, notify_on_return = ? WHERE user_id = ?', [store_status, vacation_message, !!notify_on_return, req.user.id]);
    res.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
});

// Update vendor profile info (first/last name, phone)
router.put('/profile-info', verifyToken, checkRole(['vendor']), async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    if (!first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'First and last name are required' });
    }
    await pool.query('UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?', [first_name, last_name, phone, req.user.id]);
    res.json({ success: true, message: 'Profile info updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile info' });
  }
});

// Upload vendor logo
router.post('/logo', 
  verifyToken,
  checkRole(['vendor']),
  logoUpload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No logo file uploaded'
        });
      }

      if (req.fileValidationError) {
        return res.status(400).json({
          success: false,
          message: req.fileValidationError
        });
      }

      // Upload to S3
      const s3Url = await uploadFileToS3(req.file, 'logos');
      
      // Get existing logo URL to delete from S3
      const [[profile]] = await pool.query(
        'SELECT logo_url FROM vendor_profiles WHERE user_id = ?',
        [req.user.id]
      );

      // Delete old logo from S3 if exists
      if (profile && profile.logo_url) {
        await deleteFileFromS3(profile.logo_url);
      }

      // Update vendor profile with new logo URL
      await pool.query(`
        UPDATE vendor_profiles
        SET logo_url = ?
        WHERE user_id = ?
      `, [s3Url, req.user.id]);

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        logo_url: s3Url
      });
    } catch (error) {
      console.error('Error uploading vendor logo:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading vendor logo'
      });
    }
  }
);

// Get vendor logo
router.get('/logo',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      // Get the vendor's logo URL
      const [profiles] = await pool.query(`
        SELECT logo_url
        FROM vendor_profiles
        WHERE user_id = ?
      `, [req.user.id]);

      if (profiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }

      const logoUrl = profiles[0].logo_url;
      
      res.json({
        success: true,
        logo_url: logoUrl ? `${BASE_URL}${logoUrl}` : null
      });
    } catch (error) {
      console.error('Error getting vendor logo:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting vendor logo'
      });
    }
  }
);

// Add new product (Vendor)
router.post('/products',
  verifyToken,
  checkRole(['vendor']),
  productUpload.array('images'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, category_id, price, stock_quantity, status, description } = req.body;
      const images = req.files;
      console.log('Received images:', images ? images.map(f => f.originalname) : images);

      // Get vendor profile ID
      const [[vendorProfile]] = await pool.query(
        'SELECT id FROM vendor_profiles WHERE user_id = ?',
        [req.user.id]
      );
      if (!vendorProfile) {
        console.error('Vendor profile not found for user:', req.user.id);
        return res.status(404).json({ success: false, message: 'Vendor profile not found' });
      }
      const vendorProfileId = vendorProfile.id;

      // Save product to database first
      const [productResult] = await pool.query(`
        INSERT INTO products (vendor_id, name, description, price, stock_quantity, status, category_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [vendorProfileId, name, description, price, stock_quantity, status, category_id]);

      const productId = productResult.insertId;

      // Handle image uploads to S3
      if (images && images.length > 0) {
        try {
          const imagePromises = images.map(async (file, index) => {
            console.log('Uploading to S3:', file.originalname);
            const s3Url = await uploadFileToS3(file, 'products');
            console.log('S3 upload success:', s3Url);
            return [productId, s3Url, index === 0]; // First image is primary
          });

          const imageResults = await Promise.all(imagePromises);
          
          // Save image URLs to database
          await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
            [imageResults]
          );
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError);
          // If image upload fails, delete the product
          await pool.query('DELETE FROM products WHERE id = ?', [productId]);
          return res.status(500).json({ success: false, message: 'Failed to upload product images', error: uploadError.message });
        }
      } else {
        console.warn('No images received for product upload.');
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        productId: productId
      });

    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  }
);

// Update product (Vendor)
router.put('/products/:id',
  verifyToken,
  checkRole(['vendor']),
  productUpload.array('images'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, category_id, price, stock_quantity, status, description } = req.body;
      const images = req.files;

      // Verify product ownership
      const [[product]] = await pool.query(`
        SELECT p.* FROM products p
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE p.id = ? AND vp.user_id = ?
      `, [id, req.user.id]);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or unauthorized'
        });
      }

      // Update product details
      await pool.query(`
        UPDATE products
        SET name = ?, description = ?, price = ?, stock_quantity = ?, status = ?, category_id = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, description, price, stock_quantity, status, category_id, id]);

      // Handle new image uploads if any
      if (images && images.length > 0) {
        // Get existing images
        const [existingImages] = await pool.query(
          'SELECT image_url FROM product_images WHERE product_id = ?',
          [id]
        );

        // Delete old images from S3
        for (const image of existingImages) {
          await deleteFileFromS3(image.image_url);
        }

        // Delete old image records
        await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);

        // Upload new images
        const imagePromises = images.map(async (file, index) => {
          const s3Url = await uploadFileToS3(file, 'products');
          return [id, s3Url, index === 0]; // First image is primary
        });

        const imageResults = await Promise.all(imagePromises);
        
        // Save new image URLs
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
          [imageResults]
        );
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });

    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product'
      });
    }
  }
);

// Delete product (Vendor)
router.delete('/products/:id',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Optional: Fetch image URLs from DB and delete from S3 before deleting product
      // const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
      // for (const img of images) {
      //     await deleteFileFromS3(img.image_url);
      // }

      // Delete product from the database (including product_images due to foreign key CASCADE DELETE if set up)
      const [result] = await pool.query(
        'DELETE FROM products WHERE id = ? AND vendor_id = (SELECT id FROM vendor_profiles WHERE user_id = ?)',
        [id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
      }

      res.json({ success: true, message: 'Product deleted successfully' });

    } catch (error) {
      console.error('Error deleting product:', error);
       // In a real app, you might want error handling here if DB delete fails after S3 delete
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  }
);

module.exports = router; 