import { query } from '../config/database.js';

export const getCandidates = async (filters = {}) => {
  const { limit = 20, offset = 0, search = '', location = '' } = filters;
  
  let sql = 'SELECT * FROM candidates WHERE is_active = true';
  const params = [];
  let paramCount = 1;

  if (search) {
    sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR title ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (location) {
    sql += ` AND location = $${paramCount}`;
    params.push(location);
    paramCount++;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getCandidateById = async (id) => {
  const result = await query(
    'SELECT * FROM candidates WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0];
};

export const getCandidateCount = async () => {
  const result = await query('SELECT COUNT(*) as total FROM candidates WHERE is_active = true');
  return parseInt(result.rows[0].total);
};

export default {
  getCandidates,
  getCandidateById,
  getCandidateCount,
};
