const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('✗ Database error:', err.message);
});

// Test connection on startup
pool.query('SELECT 1', (err, result) => {
  if (err) {
    console.error('✗ Database connection failed:', err.message);
  } else {
    console.log('✓ Database connection successful');
  }
});

module.exports = pool;
