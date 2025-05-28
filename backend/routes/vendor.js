const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for file system operations like deleting files

// --- CONFIGURE MULTER ---
// Set up multer storage to use your existing directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use the user's specified directory. path.join is good for cross-platform compatibility.
        // Ensure the directory exists: backend/uploads/products
        cb(null, path.join(__dirname, '../uploads/products/'));
    },
    filename: function (req, file, cb) {
        // Define how files should be named (e.g., include timestamp and original extension)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Get the original file extension
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// You can add file filtering if needed (e.g., only allow images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

// GET /api/vendor/products
// Fetches products for the vendor with pagination, search, and filter support
router.get('/products', authenticateToken, async (req, res) => {
    try {
        const { page = 1, search = '', category = '' } = req.query;
        const limit = 10; // Number of products per page
        const skip = (page - 1) * limit;

        // Build the query based on search and category
        const query = { vendorId: req.user.id };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        // Fetch products from the database
        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Count total products for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({ products, totalPages });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/vendor/products/:id
// Get a single product by ID
router.get('/products/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/vendor/products
// Create a new product with file uploads and variants
// Use upload.array('images', maxCount) for multiple files with the field name 'images'
router.post('/products', authenticateToken, upload.array('images', 5), async (req, res) => {
    let connection; // Declare connection variable for transaction

    try {
        // req.body contains the text fields
        // req.files is an array of file objects if using upload.array
        const { name, category, price, stock, status, description, variants: variantsJson } = req.body;
        const uploadedImages = req.files;

        // --- Process Uploaded Images ---
        // Get the paths of the saved images relative to the uploads directory, or full URLs
        // Store paths relative to your static serve directory (e.g., /uploads/products/filename.jpg)
        const imageUrls = uploadedImages ? uploadedImages.map(file => `/uploads/products/${path.basename(file.path)}`) : [];

        // --- Parse Variants JSON String ---
        let variants = [];
        if (variantsJson) {
            try {
                variants = JSON.parse(variantsJson);
                // Optional: Add validation for variant structure here
                // Ensure each variant has option_name, option_value, price, stock and they are of correct types
                if (!Array.isArray(variants) || variants.some(v =>
                    typeof v.option_name !== 'string' ||
                    typeof v.option_value !== 'string' ||
                    typeof v.price !== 'number' ||
                    typeof v.stock !== 'number'
                )) {
                     throw new Error('Invalid variants data format or structure.');
                }

            } catch (e) {
                console.error("Error parsing variants JSON:", e);
                 // Clean up uploaded files if JSON parsing fails
                 uploadedImages.forEach(file => fs.unlink(file.path, err => console.error('Failed to delete file:', err)));
                return res.status(400).json({ message: e.message || "Invalid variants data format." });
            }
        }

        // --- Start MySQL Transaction ---
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- Insert Product into MySQL ---
        const [productResult] = await connection.query(
            'INSERT INTO products (vendor_id, name, category, price, stock_quantity, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, name, category, price, stock, status, description] // Note: Using 'stock_quantity' for database column name based on frontend
        );

        const newProductId = productResult.insertId;

        // --- Insert Images into MySQL (assuming a separate product_images table) ---
        if (imageUrls.length > 0) {
            const imageValues = imageUrls.map(url => [newProductId, url, imageUrls.indexOf(url) === 0]); // Assuming first image is primary
            await connection.query(
                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
                [imageValues] // Using batch insert
            );
        }

        // --- Insert Variants into MySQL (assuming a separate product_variants table) ---
         if (variants.length > 0) {
             const variantValues = variants.map(v => [newProductId, v.option_name, v.option_value, v.price, v.stock]);
             await connection.query(
                 'INSERT INTO product_variants (product_id, option_name, option_value, price, stock) VALUES ?',
                 [variantValues] // Using batch insert
             );
         }

        // --- Commit Transaction ---
        await connection.commit();

        // --- Fetch the newly created product to return ---
        // You might want to join with product_images and product_variants if needed,
        // but for simplicity, fetching the basic product details.
        const [newProductRows] = await pool.query('SELECT * FROM products WHERE id = ?', [newProductId]);
        const newProduct = newProductRows[0]; // Assuming id is the primary key

        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Error creating product:', error);

        // --- Rollback Transaction in case of error ---
        if (connection) {
            try {
                await connection.rollback();
                console.log('Transaction rolled back.');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }

        // --- Clean up uploaded files in case of error ---
        if (uploadedImages && uploadedImages.length > 0) {
             uploadedImages.forEach(file => {
                 fs.unlink(file.path, err => {
                     if (err) console.error(`Failed to delete uploaded file ${file.path}:`, err);
                     else console.log(`Deleted uploaded file: ${file.path}`);
                 });
             });
         }

        res.status(500).json({ message: 'Internal server error or error processing data' });

    } finally {
        // --- Release Connection ---
        if (connection) {
            connection.release();
            console.log('Database connection released.');
        }
    }
});

// PUT /api/vendor/products/:id
// Update a product
router.put('/products/:id', authenticateToken, async (req, res) => {
    try {
        const { name, category, price, stock, status, description } = req.body;

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user.id },
            { name, category, price, stock, status, description },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/vendor/products/:id
// Delete a product
router.delete('/products/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 