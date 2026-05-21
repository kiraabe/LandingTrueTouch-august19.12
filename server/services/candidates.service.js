import { query } from '../config/database.js';

export const getCandidates = async (filters = {}) => {
  try {
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
    return result.rows || [];
  } catch (error) {
    console.error('Error getting candidates:', error.message);
    return [];
  }
};

export const getCandidateById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM candidates WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting candidate:', error.message);
    return null;
  }
};

export const getCandidateCount = async () => {
  try {
    const result = await query('SELECT COUNT(*) as total FROM candidates WHERE is_active = true');
    return parseInt(result.rows?.[0]?.total || 0);
  } catch (error) {
    console.error('Error getting candidate count:', error.message);
    return 0;
  }
};

export default {
  getCandidates,
  getCandidateById,
  getCandidateCount,
};
