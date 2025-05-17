const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin, logAdminAction } = require('../middleware/admin.middleware');
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Apply admin middleware to all routes
router.use(verifyToken);
router.use(isAdmin);
router.use(logAdminAction);

// User Management Routes
router.get('/users',
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

router.put('/users/:id', async (req, res) => {
    try {
        const { role, first_name, last_name } = req.body;
        const [result] = await db.query(
            'UPDATE users SET role = ?, first_name = ?, last_name = ? WHERE id = ?',
            [role, first_name, last_name, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Product Management Routes (with pagination)
// Get all products (admin, paginated)
router.get('/products', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get total count
        const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM products');
        const totalPages = Math.max(1, Math.ceil(count / limit));

        // Get paginated products
        const [products] = await pool.query(`
            SELECT p.id, p.name, p.description, v.business_name AS vendor_name, c.name AS category, p.price, p.stock_quantity AS stock_quantity, p.status, p.created_at, p.category_id, p.featured
            FROM products p
            LEFT JOIN vendor_profiles v ON p.vendor_id = v.id
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        res.json({
            success: true,
            products,
            total: count,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});
router.put('/products/:id', async (req, res) => {
    try {
        const { name, description, price, stock_quantity, status, category_id } = req.body;
        const [result] = await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, status = ?, category_id = ? WHERE id = ?',
            [name, description, price, stock_quantity, status, category_id, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// Mark/unmark a product as featured
router.put('/products/:id/featured', async (req, res) => {
    try {
        const { featured } = req.body; // expects 1 or 0
        const [result] = await db.query(
            'UPDATE products SET featured = ? WHERE id = ?',
            [featured, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product featured status updated' });
    } catch (error) {
        console.error('Error updating featured status:', error);
        res.status(500).json({ success: false, message: 'Failed to update featured status' });
    }
});

// Get all featured products
router.get('/products/featured', async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC'
        );
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
    }
});

// Order Management Routes
router.get('/orders', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const page = Number.isInteger(Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = Number.isInteger(Number(req.query.limit)) ? Number(req.query.limit) : 20;
        const offset = (page - 1) * limit;
        console.log('limit:', limit, 'offset:', offset); // Debug log

        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM orders');
        const totalPages = Math.max(1, Math.ceil(count / limit));
        const [orders] = await db.query(`
            SELECT o.*, u.email as customer_email, u.first_name, u.last_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `);
        res.json({ success: true, orders, total: count, totalPages, currentPage: page });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

router.put('/orders/:id/status', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

router.get('/orders/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, u.email as customer_email, u.first_name, u.last_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.id = ?
        `, [req.params.id]);
        if (!orders.length) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [req.params.id]);
        res.json({ success: true, order: orders[0], items });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details' });
    }
});

// Analytics Routes
router.get('/analytics', async (req, res) => {
    try {
        const [userStats] = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'vendor' THEN 1 END) as vendor_count
            FROM users
        `);

        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_orders_30d,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM orders
        `);

        const [productStats] = await db.query(`
            SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(stock_quantity), 0) as total_stock,
                COALESCE(AVG(price), 0) as avg_price
            FROM products
        `);

        res.json({
            success: true,
            analytics: {
                users: userStats[0],
                orders: orderStats[0],
                products: productStats[0]
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});

// Settings Routes
router.get('/settings', async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM admin_settings');
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});

router.put('/settings/:key', async (req, res) => {
    try {
        const { value } = req.body;
        const [result] = await db.query(
            'UPDATE admin_settings SET setting_value = ? WHERE setting_key = ?',
            [value, req.params.key]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }
        
        res.json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ success: false, message: 'Failed to update setting' });
    }
});

// Audit Logs Route
router.get('/audit-logs', async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT al.*, u.email as admin_email
            FROM audit_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `);
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
});

// BULK ACTIONS
// Bulk delete users
router.post('/users/bulk-delete', async (req, res) => {
    try {
        const { userIds } = req.body; // expects an array of user IDs
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No user IDs provided' });
        }
        const [result] = await db.query(
            `DELETE FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
            userIds
        );
        res.json({ success: true, message: `${result.affectedRows} users deleted` });
    } catch (error) {
        console.error('Error bulk deleting users:', error);
        res.status(500).json({ success: false, message: 'Failed to bulk delete users' });
    }
});

// Bulk update product status
router.post('/products/bulk-status', async (req, res) => {
    try {
        const { productIds, status } = req.body; // expects array of IDs and a status string
        if (!Array.isArray(productIds) || productIds.length === 0 || !status) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }
        const [result] = await db.query(
            `UPDATE products SET status = ? WHERE id IN (${productIds.map(() => '?').join(',')})`,
            [status, ...productIds]
        );
        res.json({ success: true, message: `${result.affectedRows} products updated` });
    } catch (error) {
        console.error('Error bulk updating products:', error);
        res.status(500).json({ success: false, message: 'Failed to bulk update products' });
    }
});

// REVIEW MODERATION
// List all reviews
router.get('/reviews', async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT r.*, u.email as user_email, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);
        res.json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// Approve or hide a review
router.put('/reviews/:id/moderate', async (req, res) => {
    try {
        const { status } = req.body; // expects 'approved' or 'hidden'
        const [result] = await db.query(
            'UPDATE reviews SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, message: 'Review status updated' });
    } catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({ success: false, message: 'Failed to moderate review' });
    }
});

// Delete a review
router.delete('/reviews/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

// ADVANCED REPORTING & ANALYTICS
// Top products by sales
router.get('/analytics/top-products', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.id, p.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch top products' });
    }
});

// Sales over time (last 30 days)
router.get('/analytics/sales-over-time', async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as total_sales
            FROM orders
            WHERE status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);
        res.json({ success: true, sales });
    } catch (error) {
        console.error('Error fetching sales over time:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sales data' });
    }
});

// Dashboard & Analytics Routes
router.get('/dashboard/analytics', async (req, res) => {
    try {
        const [userStats] = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'vendor' THEN 1 END) as vendor_count
            FROM users
        `);

        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_orders_30d,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM orders
        `);

        const [productStats] = await db.query(`
            SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(stock_quantity), 0) as total_stock,
                COALESCE(AVG(price), 0) as avg_price
            FROM products
        `);

        res.json({ success: true, userStats, orderStats, productStats });
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard analytics' });
    }
});

// Bulk User Actions
router.post('/users/bulk', async (req, res) => {
    try {
        const { action, userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ success: false, message: 'Invalid user IDs' });
        }
        let query;
        switch (action) {
            case 'delete':
                query = 'DELETE FROM users WHERE id IN (?)';
                break;
            case 'updateRole':
                const { role } = req.body;
                if (!role) {
                    return res.status(400).json({ success: false, message: 'Role is required' });
                }
                query = 'UPDATE users SET role = ? WHERE id IN (?)';
                await db.query(query, [role, userIds]);
                return res.json({ success: true, message: 'Users updated successfully' });
            default:
                return res.status(400).json({ success: false, message: 'Invalid action' });
        }
        await db.query(query, [userIds]);
        res.json({ success: true, message: 'Bulk action completed successfully' });
    } catch (error) {
        console.error('Error performing bulk user action:', error);
        res.status(500).json({ success: false, message: 'Failed to perform bulk user action' });
    }
});

// Bulk Product Import/Export
router.post('/products/bulk/import', async (req, res) => {
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Invalid products data' });
        }
        // Example: Insert products into the database
        for (const product of products) {
            await db.query(
                'INSERT INTO products (name, description, price, stock, status) VALUES (?, ?, ?, ?, ?)',
                [product.name, product.description, product.price, product.stock, product.status || 'active']
            );
        }
        res.json({ success: true, message: 'Products imported successfully' });
    } catch (error) {
        console.error('Error importing products:', error);
        res.status(500).json({ success: false, message: 'Failed to import products' });
    }
});

router.get('/products/bulk/export', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({ success: false, message: 'Failed to export products' });
    }
});

// Advanced Order Filtering
router.get('/orders/filtered', async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = `
            SELECT o.*, 
                   u.email as user_email,
                   u.first_name,
                   u.last_name,
                   COUNT(DISTINCT oi.id) as item_count,
                   COALESCE(SUM(oi.quantity * oi.price), 0) as total_amount
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        const params = [];
        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        if (startDate) {
            query += ' AND o.created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND o.created_at <= ?';
            params.push(endDate);
        }
        query += ' GROUP BY o.id, u.email, u.first_name, u.last_name ORDER BY o.created_at DESC';
        const [orders] = await db.query(query, params);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch filtered orders' });
    }
});

// Content Management (Blog/News)
router.get('/content', async (req, res) => {
    try {
        const [content] = await db.query('SELECT * FROM content ORDER BY created_at DESC');
        res.json({ success: true, content });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
});

router.post('/content', async (req, res) => {
    try {
        const { title, body, type } = req.body;
        await db.query(
            'INSERT INTO content (title, body, type) VALUES (?, ?, ?)',
            [title, body, type]
        );
        res.json({ success: true, message: 'Content created successfully' });
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ success: false, message: 'Failed to create content' });
    }
});

router.put('/content/:id', async (req, res) => {
    try {
        const { title, body, type } = req.body;
        const [result] = await db.query(
            'UPDATE content SET title = ?, body = ?, type = ? WHERE id = ?',
            [title, body, type, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.json({ success: true, message: 'Content updated successfully' });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ success: false, message: 'Failed to update content' });
    }
});

router.delete('/content/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM content WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ success: false, message: 'Failed to delete content' });
    }
});
// Delete a product (admin)
router.delete('/products/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    const productId = req.params.id;
    try {
        // Delete from all dependent tables
        await db.query('DELETE FROM product_qa WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM wishlist WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM shopping_cart WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM order_items WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM reviews WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM product_specifications WHERE product_id = ?', [productId]);
        await db.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
        // Add more as needed for your schema

        // Now delete the product
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [productId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});
// Vendors endpoint
router.get('/vendors', async (req, res) => {
    try {
        const [vendors] = await db.query('SELECT * FROM vendors');
        res.json({ success: true, vendors });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
    }
});

// Get all categories
router.get('/categories', verifyToken, async (req, res) => {
    console.log('User in /categories:', req.user);
    try {
        const [categories] = await db.query('SELECT id, name FROM categories ORDER BY name');
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});
// ... existing code ...
// Category Management (Admin)
router.post('/categories', verifyToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    try {
        await db.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
        res.json({ success: true, message: 'Category added successfully' });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, message: 'Failed to add category' });
    }
});

router.put('/categories/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    try {
        const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
});

router.delete('/categories/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route works' });
});

module.exports = router; 