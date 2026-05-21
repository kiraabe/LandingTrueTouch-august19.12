import { query } from '../config/database.js';

export const getLocations = async (filters = {}) => {
  const { limit = 20, offset = 0, search = '', country = '' } = filters;
  
  let sql = 'SELECT * FROM locations WHERE is_active = true';
  const params = [];
  let paramCount = 1;

  if (search) {
    sql += ` AND name ILIKE $${paramCount}`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (country) {
    sql += ` AND country = $${paramCount}`;
    params.push(country);
    paramCount++;
  }

  sql += ` ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getLocationById = async (id) => {
  const result = await query(
    'SELECT * FROM locations WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0];
};

export const getFeaturedLocations = async (limit = 10) => {
  const result = await query(`
    SELECT * FROM locations 
    WHERE is_active = true AND is_featured = true
    ORDER BY name ASC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

export const getCountries = async () => {
  const result = await query(`
    SELECT DISTINCT country FROM locations
    WHERE country IS NOT NULL AND is_active = true
    ORDER BY country ASC
  `);
  return result.rows.map(row => row.country);
};

export default {
  getLocations,
  getLocationById,
  getFeaturedLocations,
  getCountries,
};
