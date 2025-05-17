const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

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
// Create a new product
router.post('/products', authenticateToken, async (req, res) => {
    try {
        const { name, category, price, stock, status, description } = req.body;

        const product = new Product({
            vendorId: req.user.id,
            name,
            category,
            price,
            stock,
            status,
            description
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
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