// backend/utils/upload.js
const multer = require('multer');
const path = require('path');
// fs is no longer needed if using memory storage

// Ensure upload directories exist (This is now less critical for S3, but keeping directory creation logic elsewhere is fine)
// const productUploadDir = path.join(__dirname, '../uploads/products');
// const logoUploadDir = path.join(__dirname, '../uploads/logos');
// if (!fs.existsSync(productUploadDir)) { fs.mkdirSync(productUploadDir, { recursive: true }); }
// if (!fs.existsSync(logoUploadDir)) { fs.mkdirSync(logoUploadDir, { recursive: true }); }

// --- CONFIGURE MULTER ---
// Use memory storage to get file buffer instead of saving to disk
const storage = multer.memoryStorage(); 

// File filter (keep this)
const imageFileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure multer for products (adjust limits if needed)
const productUpload = multer({
    storage: storage, // Use memory storage
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Example: 10MB max file size
    }
});

// Configure multer for logos (adjust limits if needed)
const logoUpload = multer({
    storage: storage, // Use memory storage
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max file size for logos
    }
});

module.exports = {
    productUpload,
    logoUpload
};
