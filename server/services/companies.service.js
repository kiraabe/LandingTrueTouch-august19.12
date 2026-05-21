import { query } from '../config/database.js';

export const getCompanies = async (filters = {}) => {
  try {
    const { limit = 20, offset = 0, search = '' } = filters;

    let sql = 'SELECT * FROM employers WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND company_name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting companies:', error.message);
    return [];
  }
};

export const getCompanyById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM employers WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting company:', error.message);
    return null;
  }
};

export const getFeaturedCompanies = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT * FROM employers
      WHERE is_active = true AND is_featured = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured companies:', error.message);
    return [];
  }
};

export default {
  getCompanies,
  getCompanyById,
  getFeaturedCompanies,
};
