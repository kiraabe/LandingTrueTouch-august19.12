import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Connection validation
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DB Query]', { text: text.substring(0, 50) + '...', duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('[DB Error]', { text, error: error.message });
    throw error;
  }
};

export const getClient = async () => {
  return pool.connect();
};

export default pool;
