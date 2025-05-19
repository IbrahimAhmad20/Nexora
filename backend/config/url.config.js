const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

module.exports = { BASE_URL, FRONTEND_URL };
