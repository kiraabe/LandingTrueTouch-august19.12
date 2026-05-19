import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text, params = []) => {
  try {
    console.log(`[DB Query] Executing: ${text.substring(0, 100)}...`);
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB Query] Completed in ${duration}ms, returned ${result.rows.length} rows`);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export const getConnection = async () => {
  const client = await pool.connect();
  return client;
};

export const closePool = async () => {
  await pool.end();
};

export default pool;
