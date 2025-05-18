const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 5, // Railway free tier limit
  queueLimit: 0,
  connectTimeout: 20000,

});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the MySQL database:', err.message);
  }
})();

module.exports = {
  query: (sql, params) => pool.execute(sql, params),
  pool
}; 