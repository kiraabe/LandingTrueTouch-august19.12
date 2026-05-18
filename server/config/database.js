const { Pool } = require('pg');

// Use Supabase connection string if available, otherwise fall back to local config
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('✓ Using Supabase PostgreSQL connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
    };
  }

  console.log('✓ Using local PostgreSQL connection');
  return {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jobzilla',
  };
};

const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool,
};
