import { query } from '../config/database.js';

export const getCompanies = async (filters = {}) => {
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
  return result.rows;
};

export const getCompanyById = async (id) => {
  const result = await query(
    'SELECT * FROM employers WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0];
};

export const getFeaturedCompanies = async (limit = 10) => {
  const result = await query(`
    SELECT * FROM employers 
    WHERE is_active = true AND is_featured = true
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

export default {
  getCompanies,
  getCompanyById,
  getFeaturedCompanies,
};
