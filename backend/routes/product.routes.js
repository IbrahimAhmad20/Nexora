console.log('Loaded product.routes.js');

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');
const { productUpload } = require('../utils/upload');

// Public: Get all featured products
router.get('/featured', async (req, res) => {
  console.log('HIT /api/products/featured');
  try {
    const [products] = await pool.query(`
      SELECT p.*, v.business_name as vendor_name, 
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN vendor_profiles v ON p.vendor_id = v.id
      WHERE p.featured = 1 AND p.status = 'active'
      ORDER BY p.created_at DESC
    `);

    // Format products for frontend
    const formatted = products.map(p => ({
      ...p,
      image: p.primary_image,
      vendor: { name: p.vendor_name },
      price: parseFloat(p.price)
    }));

    res.json({ success: true, products: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query; // Get search query parameter
        let query = `
            SELECT p.*, v.business_name as vendor_name, AVG(r.rating) as rating, COUNT(r.id) as reviews,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            JOIN vendor_profiles v ON p.vendor_id = v.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.status = 'active'
        `;
        const queryParams = [];

        if (search) {
            // Add search condition
            query += `
                AND (p.name LIKE ? OR p.description LIKE ?)
            `;
            // Add wildcards for partial matching and add to query parameters
            queryParams.push(`%${search}%`);
            queryParams.push(`%${search}%`);
        }

        query += `
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        console.log('Executing products query:', query, queryParams);

        const [products] = await pool.query(query, queryParams);

        res.json({
            products,
            totalPages: 1 // Assuming no pagination for now
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            message: 'Error fetching products'
        });
    }
});

// Get single product (public)

// Create product (vendor only)
router.post('/',
    verifyToken,
    checkRole(['vendor']),
    productUpload.array('images', 5), // Allow up to 5 images
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('description').notEmpty().withMessage('Product description is required'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a positive number'),
        body('category').notEmpty().withMessage('Category is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            // Check for file upload errors
            if (req.fileValidationError) {
                return res.status(400).json({
                    success: false,
                    message: req.fileValidationError
                });
            }

            const { name, description, price, stock_quantity, category } = req.body;

            // Get vendor profile ID
            const [vendorProfiles] = await pool.query(
                'SELECT id FROM vendor_profiles WHERE user_id = ?',
                [req.user.id]
            );

            if (vendorProfiles.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Vendor profile not found'
                });
            }

            const vendorId = vendorProfiles[0].id;

            // Start transaction
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Create product
                const [result] = await connection.query(
                    'INSERT INTO products (vendor_id, name, description, price, stock_quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
                    [vendorId, name, description, price, stock_quantity, category]
                );

                // Upload images
                if (req.files && req.files.length > 0) {
                    const imageValues = req.files.map((file, index) => [
                        result.insertId,
                        `/uploads/products/${file.filename}`,
                        index === 0 // First image is primary
                    ]);

                    await connection.query(
                        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
                        [imageValues]
                    );
                }

                const variants = req.body.variants ? JSON.parse(req.body.variants) : [];
                if (variants.length > 0) {
                    for (const variant of variants) {
                        // Insert into product_variants
                        const [variantResult] = await connection.query(
                            'INSERT INTO product_variants (product_id, price, stock) VALUES (?, ?, ?)',
                            [result.insertId, variant.price, variant.stock]
                        );
                        // Insert into variant_options
                        await connection.query(
                            'INSERT INTO variant_options (variant_id, option_name, option_value) VALUES (?, ?, ?)',
                            [variantResult.insertId, variant.option_name, variant.option_value]
                        );
                    }
                }

                await connection.commit();

                res.status(201).json({
                    success: true,
                    message: 'Product created successfully',
                    productId: result.insertId
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating product'
            });
        }
    }
);

// Update product (vendor only)
router.put('/:id',
  verifyToken,
  checkRole(['vendor']),
  productUpload.array('images', 5),
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive number'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const productId = req.params.id;
      const { name, description, price, stock_quantity, category } = req.body;

      // Check if product exists and belongs to vendor
      const [products] = await pool.query(`
        SELECT p.* FROM products p
        JOIN vendor_profiles v ON p.vendor_id = v.id
        WHERE p.id = ? AND v.user_id = ?
      `, [productId, req.user.id]);

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or unauthorized'
        });
      }

      // Update product
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (description) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (price) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }
      if (stock_quantity) {
        updateFields.push('stock_quantity = ?');
        updateValues.push(stock_quantity);
      }
      if (category) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }

      if (updateFields.length > 0) {
        updateValues.push(productId);
        await pool.query(
          `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Handle new images
      if (req.files && req.files.length > 0) {
        // Set all existing images to not primary
        await pool.query(
          'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
          [productId]
        );

        // Insert new images, first one as primary
        const imageValues = req.files.map((file, index) => [
          productId,
          `/uploads/products/${file.filename}`,
          index === 0 // First image is primary
        ]);
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
          [imageValues]
        );
      }

      await pool.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      const variants = req.body.variants ? JSON.parse(req.body.variants) : [];
      if (variants.length > 0) {
          for (const variant of variants) {
              const [variantResult] = await pool.query(
                  'INSERT INTO product_variants (product_id, price, stock) VALUES (?, ?, ?)',
                  [productId, variant.price, variant.stock]
              );
              await pool.query(
                  'INSERT INTO variant_options (variant_id, option_name, option_value) VALUES (?, ?, ?)',
                  [variantResult.insertId, variant.option_name, variant.option_value]
              );
          }
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product'
      });
    }
  }
);

// Delete product (vendor only)
router.delete('/:id',
  verifyToken,
  checkRole(['vendor']),
  async (req, res) => {
    try {
      const productId = req.params.id;

      // Check if product exists and belongs to vendor
      const [products] = await pool.query(`
        SELECT p.* FROM products p
        JOIN vendor_profiles v ON p.vendor_id = v.id
        WHERE p.id = ? AND v.user_id = ?
      `, [productId, req.user.id]);

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or unauthorized'
        });
      }

      // Soft delete (update status)
      await pool.query(
        'UPDATE products SET status = ? WHERE id = ?',
        ['deleted', productId]
      );

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  }
);

// Get product details by id (with all images, vendor info, and stock)
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, v.business_name as vendor_name, v.id as vendor_id
      FROM products p
      JOIN vendor_profiles v ON p.vendor_id = v.id
      WHERE p.id = ? AND p.status = 'active'
    `, [req.params.id]);
    if (products.length === 0) return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    const product = products[0];
    // Get all images
    const [images] = await pool.query('SELECT image_url as url, is_primary FROM product_images WHERE product_id = ?', [product.id]);
    // Get stock
    product.stock = product.stock_quantity;
    product.images = images;
    product.image = images.find(i => i.is_primary)?.url || (images[0] && images[0].url) || null;
    product.vendor = { id: product.vendor_id, name: product.vendor_name };
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

// Get product reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.*, u.first_name, u.last_name 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? 
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    res.json({
      success: true,
      reviews: reviews || []
    });
  } catch (err) {
    res.json({ success: true, reviews: [] });
  }
});

// Submit product review
router.post('/:id/reviews',
  verifyToken,
  checkRole(['customer']),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('text').notEmpty().withMessage('Review text is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { rating, text } = req.body;
      const productId = req.params.id;

      // Check if user has purchased the product
      const [orders] = await pool.query(`
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ? AND oi.product_id = ? AND o.status = 'completed'
        LIMIT 1
      `, [req.user.id, productId]);

      if (orders.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You must purchase this product to review it'
        });
      }

      // Check if user already reviewed
      const [existingReviews] = await pool.query(
        'SELECT 1 FROM reviews WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      );

      if (existingReviews.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }

      // Add review
      await pool.query(
        'INSERT INTO reviews (user_id, product_id, rating, text) VALUES (?, ?, ?, ?)',
        [req.user.id, productId, rating, text]
      );

      res.json({
        success: true,
        message: 'Review submitted successfully'
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to submit review'
      });
    }
  }
);

// Get product Q&A
router.get('/:id/qa', async (req, res) => {
  try {
    const [qa] = await pool.query(`
      SELECT qa.*, 
        u1.first_name as asker_first_name, u1.last_name as asker_last_name,
        u2.first_name as answerer_first_name, u2.last_name as answerer_last_name
      FROM product_qa qa
      LEFT JOIN users u1 ON qa.user_id = u1.id
      LEFT JOIN users u2 ON qa.answered_by = u2.id
      WHERE qa.product_id = ?
      ORDER BY qa.created_at DESC
    `, [req.params.id]);
    res.json({
      success: true,
      qa: (qa || []).map(q => ({
        ...q,
        asker: q.asker_first_name ? `${q.asker_first_name} ${q.asker_last_name}` : 'Anonymous',
        answerer: q.answerer_first_name ? `${q.answerer_first_name} ${q.answerer_last_name}` : null
      }))
    });
  } catch (err) {
    res.json({ success: true, qa: [] });
  }
});

// Ask a question
router.post('/:id/qa',
  verifyToken,
  checkRole(['customer']),
  [body('question').notEmpty().withMessage('Question is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      await pool.query(
        'INSERT INTO product_qa (product_id, user_id, question) VALUES (?, ?, ?)',
        [req.params.id, req.user.id, req.body.question]
      );

      res.json({ success: true, message: 'Question submitted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to submit question' });
    }
  }
);

// Answer a question (vendor only)
router.post('/:id/qa/:qaId/answer',
  verifyToken,
  checkRole(['vendor']),
  [body('answer').notEmpty().withMessage('Answer is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Verify vendor owns the product
      const [products] = await pool.query(`
        SELECT 1 FROM products p
        JOIN vendor_profiles v ON p.vendor_id = v.id
        WHERE p.id = ? AND v.user_id = ?
      `, [req.params.id, req.user.id]);

      if (products.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to answer questions for this product'
        });
      }

      await pool.query(
        'UPDATE product_qa SET answer = ?, answered_by = ?, answered_at = NOW() WHERE id = ?',
        [req.body.answer, req.user.id, req.params.qaId]
      );

      res.json({ success: true, message: 'Answer submitted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to submit answer' });
    }
  }
);

// Add to wishlist
router.post('/:id/wishlist',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      // Check if already in wishlist
      const [existing] = await pool.query(
        'SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ?',
        [req.user.id, req.params.id]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      await pool.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [req.user.id, req.params.id]
      );

      res.json({ success: true, message: 'Added to wishlist' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }
  }
);

// Remove from wishlist
router.delete('/:id/wishlist',
  verifyToken,
  checkRole(['customer']),
  async (req, res) => {
    try {
      await pool.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [req.user.id, req.params.id]
      );

      res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
    }
  }
);

// Get product variants
router.get('/:id/variants', async (req, res) => {
  try {
    const [variants] = await pool.query(`
      SELECT v.*, 
        GROUP_CONCAT(DISTINCT o.option_name) as options,
        GROUP_CONCAT(DISTINCT o.option_value) as values
      FROM product_variants v
      LEFT JOIN variant_options o ON v.id = o.variant_id
      WHERE v.product_id = ?
      GROUP BY v.id
    `, [req.params.id]);
    res.json({ success: true, variants: variants || [] });
  } catch (err) {
    res.json({ success: true, variants: [] });
  }
});

// Get product specifications
router.get('/:id/specs', async (req, res) => {
  try {
    const [specs] = await pool.query(`
      SELECT * FROM product_specifications
      WHERE product_id = ?
      ORDER BY category, display_order
    `, [req.params.id]);
    // Group specs by category
    const groupedSpecs = (specs || []).reduce((acc, spec) => {
      if (!acc[spec.category]) acc[spec.category] = [];
      acc[spec.category].push(spec);
      return acc;
    }, {});
    res.json({ success: true, specifications: groupedSpecs });
  } catch (err) {
    res.json({ success: true, specifications: {} });
  }
});

// Get related products (with primary image, fallback to same category)
router.get('/:id/related', async (req, res) => {
  try {
    const productId = req.params.id;
    // Try explicit related products first
    const [relatedRows] = await pool.query(
      'SELECT related_product_id FROM related_products WHERE product_id = ?',
      [productId]
    );
    let products = [];
    if (relatedRows.length) {
      const relatedIds = relatedRows.map(r => r.related_product_id);
      [products] = await pool.query(
        `SELECT p.*, 
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM products p
         WHERE p.id IN (?) AND p.status = 'active'`,
        [relatedIds]
      );
    } else {
      // Fallback: get products from the same category
      const [[product]] = await pool.query('SELECT category_id FROM products WHERE id = ?', [productId]);
      if (product) {
        [products] = await pool.query(
          `SELECT p.*, 
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
           FROM products p
           WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
           LIMIT 4`,
          [product.category_id, productId]
        );
      }
    }
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch related products' });
  }
});

// Get products/featured
router.get('/products/featured', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE featured = 1 LIMIT 6');
    if (!rows.length) {
      return res.json({ success: false, message: 'No featured products found' });
    }
    res.json({ success: true, products: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 