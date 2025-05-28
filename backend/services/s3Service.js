const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const uploadFileToS3 = async (file, folder = 'products') => {
    if (!S3_BUCKET_NAME) {
        throw new Error('S3_BUCKET_NAME environment variable is not set.');
    }

    // Create a unique filename (similar to your current logic)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${folder}/${file.fieldname}-${uniqueSuffix}${extension}`;

    // S3 upload parameters
    const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: filename, // Path and name of the file in the bucket
        Body: file.buffer, // The file buffer from memory storage
        ContentType: file.mimetype // Set the content type
        // ACL: 'public-read' // No longer needed if bucket policy is set for public read
    };

    try {
        const uploadResult = await s3.upload(uploadParams).promise();
        // uploadResult.Location contains the public URL of the uploaded file
        return uploadResult.Location;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
};

// Function to delete a file from S3 (useful when deleting products or updating images)
const deleteFileFromS3 = async (fileUrl) => {
     if (!S3_BUCKET_NAME) {
        throw new Error('S3_BUCKET_NAME environment variable is not set.');
    }

    // Extract the key from the S3 URL
    // Example URL: https://YOUR_BUCKET_NAME.s3.your-region.amazonaws.com/uploads/products/image.png
    // Key: uploads/products/image.png
    const urlParts = fileUrl.split('/');
    // Find the bucket name in the URL and take everything after it
    const bucketIndex = urlParts.findIndex(part => part === S3_BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex >= urlParts.length - 1) {
         console.warn(`Could not extract S3 key from URL: ${fileUrl}`);
         return; // Cannot delete if URL format is unexpected
    }
    const s3Key = urlParts.slice(bucketIndex + 1).join('/');


    const deleteParams = {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key
    };

    try {
        await s3.deleteObject(deleteParams).promise();
        console.log(`File deleted from S3: ${s3Key}`);
    } catch (error) {
         // Log error but don't necessarily fail the main request if delete fails
        console.error(`Error deleting file from S3 (${s3Key}):`, error);
    }
};


module.exports = {
    uploadFileToS3,
    deleteFileFromS3
}; 