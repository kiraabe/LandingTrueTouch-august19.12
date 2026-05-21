import { query } from '../config/database.js';

export const getBlogs = async (filters = {}) => {
  const { limit = 20, offset = 0, search = '' } = filters;
  
  let sql = 'SELECT * FROM blogs WHERE is_published = true';
  const params = [];
  let paramCount = 1;

  if (search) {
    sql += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  sql += ` ORDER BY published_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getBlogById = async (id) => {
  const result = await query(
    'SELECT * FROM blogs WHERE id = $1 AND is_published = true',
    [id]
  );
  return result.rows[0];
};

export const getLatestBlogs = async (limit = 10) => {
  const result = await query(`
    SELECT * FROM blogs 
    WHERE is_published = true
    ORDER BY published_date DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

export default {
  getBlogs,
  getBlogById,
  getLatestBlogs,
};
