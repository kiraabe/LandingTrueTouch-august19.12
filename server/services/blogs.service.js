import { query } from '../config/database.js';

export const getBlogs = async (filters = {}) => {
  try {
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
    return result.rows || [];
  } catch (error) {
    console.error('Error getting blogs:', error.message);
    return [];
  }
};

export const getBlogById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM blogs WHERE id = $1 AND is_published = true',
      [id]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting blog:', error.message);
    return null;
  }
};

export const getLatestBlogs = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT * FROM blogs
      WHERE is_published = true
      ORDER BY published_date DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting latest blogs:', error.message);
    return [];
  }
};

export default {
  getBlogs,
  getBlogById,
  getLatestBlogs,
};
