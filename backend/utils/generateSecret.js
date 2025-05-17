const crypto = require('crypto');

// Generate a random 64-byte hex string
const secret = crypto.randomBytes(64).toString('hex');
console.log('Your JWT Secret Key:', secret); 