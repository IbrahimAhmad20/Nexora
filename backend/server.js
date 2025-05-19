const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');
const session = require('express-session');
const passport = require('./config/passport');
const { checkMaintenanceMode } = require('./middleware/admin.middleware');

// Load environment variables
dotenv.config();
db.testConnection();
// Create Express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  }
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply maintenance mode check before routes
app.use(checkMaintenanceMode);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api', require('./routes/order.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Related Products Endpoint
app.get('/api/products/:id/related', async (req, res) => {
  try {
    const productId = req.params.id;

    // First try to get manually curated related products
    const [manualRelated] = await db.query(`
      SELECT p.*, rp.relation_type, rp.priority
      FROM related_products rp
      JOIN products p ON rp.related_product_id = p.id
      WHERE rp.product_id = ?
      ORDER BY rp.priority DESC
      LIMIT 4
    `, [productId]);

    // If we don't have enough manual relations, get category-based ones
    if (manualRelated.length < 4) {
      const [categoryRelated] = await db.query(`
        SELECT p.*, 
               COUNT(r.id) as review_count,
               AVG(r.rating) as avg_rating
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.category = (
          SELECT category 
          FROM products 
          WHERE id = ?
        )
        AND p.id != ?
        AND p.id NOT IN (
          SELECT related_product_id 
          FROM related_products 
          WHERE product_id = ?
        )
        AND p.status = 'active'
        GROUP BY p.id
        ORDER BY avg_rating DESC,
                 review_count DESC
        LIMIT ?
      `, [productId, productId, productId, 4 - manualRelated.length]);

      return res.json({
        success: true,
        related: [...manualRelated, ...categoryRelated]
      });
    }

    return res.json({
      success: true,
      related: manualRelated
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
});

// Catch-all (should be last!):
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 