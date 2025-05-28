const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// Get user's cart
router.get('/cart',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      const [cartItems] = await pool.query(`
        SELECT c.*, p.name, p.price, p.stock_quantity,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
        FROM shopping_cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ? AND p.status = 'active'
      `, [req.user.id]);

      res.json({
        success: true,
        data: cartItems
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cart'
      });
    }
  }
);

// Add item to cart
router.post('/cart',
  verifyToken,
  checkRole(['customer']),
  [
    body('product_id').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { product_id, quantity } = req.body;
      console.log('Add to Cart: Received product_id', product_id, 'and quantity', quantity);

      // Check if product exists and has enough stock
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ? AND status = ?',
        [product_id, 'active']
      );
      console.log('Add to Cart: Product check query result:', products);

      if (products.length === 0) {
        console.log('Add to Cart: Product not found or inactive, returning 404.');
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (products[0].stock_quantity < quantity) {
        console.log('Add to Cart: Not enough stock, returning 400.');
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }

      // Check if item already in cart
      const [existingItems] = await pool.query(
        'SELECT * FROM shopping_cart WHERE customer_id = ? AND product_id = ?',
        [req.user.id, product_id]
      );

      if (existingItems.length > 0) {
        // Update quantity
        await pool.query(
          'UPDATE shopping_cart SET quantity = quantity + ? WHERE customer_id = ? AND product_id = ?',
          [quantity, req.user.id, product_id]
        );
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO shopping_cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.user.id, product_id, quantity]
        );
      }

      res.json({
        success: true,
        message: 'Item added to cart'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding to cart'
      });
    }
  }
);

// Update cart item quantity
router.put('/cart/:productId',
  verifyToken,
  checkRole(['customer']),
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    try {
      console.log(`PUT /cart/:productId hit. Product ID: ${req.params.productId}, User ID: ${req.user.id}`);
      console.log('Request body:', req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      // Check if product has enough stock
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ? AND status = ?',
        [productId, 'active']
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (products[0].stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }

      // Update quantity
      await pool.query(
        'UPDATE shopping_cart SET quantity = ? WHERE customer_id = ? AND product_id = ?',
        [quantity, req.user.id, productId]
      );

      res.json({
        success: true,
        message: 'Cart updated'
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating cart'
      });
    }
  }
);

// Remove item from cart
router.delete('/cart/:productId',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      const { productId } = req.params;
      console.log(`Attempting to delete product ID: ${productId} for user: ${req.user.id}`);

      const [result] = await pool.query(
        'DELETE FROM shopping_cart WHERE customer_id = ? AND product_id = ?',
        [req.user.id, productId]
      );

      console.log('Delete query result:', result);

      // Check if a row was actually deleted
      if (result.affectedRows > 0) {
          res.json({
            success: true,
            message: 'Item removed from cart'
          });
      } else {
          // If no rows affected, it means the item wasn't in the cart for this user
          res.status(404).json({ // Return 404 if item not found in cart for this user
              success: false,
              message: 'Product not found in cart'
          });
      }

    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing from cart'
      });
    }
  }
);

// Create order from cart
router.post('/checkout',
  verifyToken,
  checkRole(['customer']),
  [
    body('addressId').notEmpty().withMessage('Shipping address ID is required'),
    body('card').isObject().optional()
  ],
  async (req, res) => {
    try {
      console.log('--- /api/checkout called by user:', req.user.id);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { addressId, card } = req.body;
      console.log('Address ID:', addressId);

      // Verify address belongs to user
      const [addresses] = await pool.query(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, req.user.id]
      );

      if (addresses.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid shipping address'
        });
      }

      const shippingAddress = addresses[0];

      // Get cart items
      const [cartItems] = await pool.query(`
        SELECT c.*, p.price, p.stock_quantity, p.vendor_id
        FROM shopping_cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ? AND p.status = 'active'
      `, [req.user.id]);
      console.log('Cart items:', cartItems);

      if (cartItems.length === 0) {
        console.log('Cart is empty');
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      console.log('Total amount:', totalAmount);

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      console.log('Transaction started');

      try {
        // If card is provided, use it for payment (do NOT save to profile)
        // If not, use saved card from user profile
        let cardToUse = card;
        if (!cardToUse) {
          // Fetch from user profile
          const [users] = await connection.query('SELECT credit_card, credit_card_expiry FROM users WHERE id = ?', [req.user.id]);
          if (!users.length || !users[0].credit_card) {
            return res.status(400).json({ success: false, message: 'No card info found.' });
          }
          cardToUse = {
            last4: users[0].credit_card,
            expiry: users[0].credit_card_expiry
          };
        }

        // Create order
        const [orderResult] = await connection.query(
          'INSERT INTO orders (customer_id, total_amount, shipping_address) VALUES (?, ?, ?)',
          [req.user.id, totalAmount, shippingAddress.address]
        );
        const orderId = orderResult.insertId;
        console.log('Order created with id:', orderId);

        // Create order items and update stock
        for (const item of cartItems) {
          // Check stock again
          if (item.stock_quantity < item.quantity) {
            console.log('Not enough stock for product:', item.product_id);
            throw new Error(`Not enough stock for product ID ${item.product_id}`);
          }

          // For each cart item:
          const [productRows] = await connection.query('SELECT vendor_id FROM products WHERE id = ?', [item.product_id]);
          const vendorId = productRows[0].vendor_id;
          console.log(`Inserting order_item for product ${item.product_id}, vendor ${vendorId}`);
          await connection.query(
            'INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.product_id, vendorId, item.quantity, item.price]
          );

          // Update stock
          console.log(`Updating stock for product ${item.product_id}`);
          await connection.query(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }

        // Clear cart
        console.log('Clearing cart for user:', req.user.id);
        await connection.query(
          'DELETE FROM shopping_cart WHERE customer_id = ?',
          [req.user.id]
        );

        await connection.commit();
        console.log('Transaction committed');

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          orderId
        });
      } catch (error) {
        await connection.rollback();
        console.log('Transaction rolled back due to error:', error.message);
        throw error;
      } finally {
        connection.release();
        console.log('Connection released');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating order'
      });
    }
  }
);

// Get user's orders
router.get('/',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      const [orders] = await pool.query(`
        SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
        FROM orders o
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
      `, [req.user.id]);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching orders'
      });
    }
  }
);

// Get order details
router.get('/:orderId',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      const { orderId } = req.params;

      // Get order
      const [orders] = await pool.query(`
        SELECT o.* FROM orders o
        WHERE o.id = ? AND o.customer_id = ?
      `, [orderId, req.user.id]);

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Get order items
      const [orderItems] = await pool.query(`
        SELECT oi.*, p.name, p.description,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      res.json({
        success: true,
        data: {
          ...orders[0],
          items: orderItems
        }
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching order details'
      });
    }
  }
);

// Alias for /cart/add to support frontend
router.post('/cart/add',
  verifyToken,
  checkRole(['customer']),
  [
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    try {
      // Map frontend's productId to product_id
      req.body.product_id = req.body.productId;
      // Reuse the logic from /cart POST
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { product_id, quantity } = req.body;
      // Check if product exists and has enough stock
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ? AND status = ?',
        [product_id, 'active']
      );
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      if (products[0].stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
      // Check if item already in cart
      const [existingItems] = await pool.query(
        'SELECT * FROM shopping_cart WHERE customer_id = ? AND product_id = ?',
        [req.user.id, product_id]
      );
      if (existingItems.length > 0) {
        // Update quantity
        await pool.query(
          'UPDATE shopping_cart SET quantity = quantity + ? WHERE customer_id = ? AND product_id = ?',
          [quantity, req.user.id, product_id]
        );
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO shopping_cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.user.id, product_id, quantity]
        );
      }
      res.json({
        success: true,
        message: 'Item added to cart'
      });
    } catch (error) {
      console.error('Error adding to cart (via /cart/add):', error);
      res.status(500).json({
        success: false,
        message: 'Error adding to cart'
      });
    }
  }
);

// Clear entire cart
router.delete('/cart',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      await pool.query(
        'DELETE FROM shopping_cart WHERE customer_id = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error clearing cart'
      });
    }
  }
);

module.exports = router; 