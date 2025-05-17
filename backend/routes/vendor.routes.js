const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { logoUpload } = require('../utils/upload');
const { Parser } = require('json2csv');

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
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE vp.user_id = ?
      `;
      let productsParams = [req.user.id];
      if (category) {
        productsQuery += ' AND p.category = ?';
        productsParams.push(category);
      }
      if (search) {
        productsQuery += ' AND p.name LIKE ?';
        productsParams.push(`%${search}%`);
      }
      productsQuery += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      productsParams.push(limit, offset);

      // Get total count for pagination
      const [[{ count }]] = await pool.query(`
        SELECT COUNT(*) as count
        FROM products p
        JOIN vendor_profiles vp ON p.vendor_id = vp.id
        WHERE vp.user_id = ?
      `, [req.user.id]);
      const totalPages = Math.max(1, Math.ceil(count / limit));

      // Fetch products
      const [products] = await pool.query(productsQuery, productsParams);

      // Fetch all images for these products
      const productIds = products.map(p => p.id);
      let imagesByProduct = {};
      if (productIds.length > 0) {
        const [images] = await pool.query(
          'SELECT product_id, image_url, is_primary FROM product_images WHERE product_id IN (?)',
          [productIds]
        );
        images.forEach(img => {
          if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
          imagesByProduct[img.product_id].push({
            url: `http://localhost:5000${img.image_url}`,
            is_primary: !!img.is_primary
          });
        });
      }
      // Map fields for frontend
      const mappedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: parseFloat(p.price),
        stock: p.stock_quantity,
        status: p.stock_quantity === 0 ? 'outofstock' : (p.status === 'deleted' ? 'inactive' : p.status),
        description: p.description,
        image: p.primary_image ? `http://localhost:5000${p.primary_image}` : null,
        images: imagesByProduct[p.id] || [],
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
        url: `http://localhost:5000${img.image_url}`,
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
        image: p.primary_image ? `http://localhost:5000${p.primary_image}` : null,
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

      res.json({
        success: true,
        data: {
          ...orders[0],
          items: orderItems
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
      `SELECT o.id, o.status, oi.price_at_time * oi.quantity AS total, o.created_at, u.first_name AS customer
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN users u ON o.customer_id = u.id
       WHERE oi.vendor_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [vendorProfileId]
    );

    res.json({
        products,
        orders,
        revenue: revenue || 0,
        averageRating: averageRating ? averageRating.toFixed(1) : 'N/A',
        recentOrders: recentOrders.map(order => ({
            id: order.id,
            status: order.status,
            total: order.total,
            customer: order.customer,
            timeAgo: order.created_at
        }))
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
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No logo file uploaded'
        });
      }

      // Check for file validation errors
      if (req.fileValidationError) {
        return res.status(400).json({
          success: false,
          message: req.fileValidationError
        });
      }

      // Update the vendor_profiles table with the logo URL
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      
      await pool.query(`
        UPDATE vendor_profiles
        SET logo_url = ?
        WHERE user_id = ?
      `, [logoUrl, req.user.id]);

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        logo_url: `http://localhost:5000${logoUrl}`
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
        logo_url: logoUrl ? `http://localhost:5000${logoUrl}` : null
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

module.exports = router; 