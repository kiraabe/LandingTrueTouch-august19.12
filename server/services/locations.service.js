import { query } from '../config/database.js';

export const getLocations = async (filters = {}) => {
  try {
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
    return result.rows || [];
  } catch (error) {
    console.error('Error getting locations:', error.message);
    return [];
  }
};

export const getLocationById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM locations WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting location:', error.message);
    return null;
  }
};

export const getFeaturedLocations = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT * FROM locations
      WHERE is_active = true AND is_featured = true
      ORDER BY name ASC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured locations:', error.message);
    return [];
  }
};

export const getCountries = async () => {
  try {
    const result = await query(`
      SELECT DISTINCT country FROM locations
      WHERE country IS NOT NULL AND is_active = true
      ORDER BY country ASC
    `);
    return result.rows?.map(row => row.country) || [];
  } catch (error) {
    console.error('Error getting countries:', error.message);
    return [];
  }
};

export default {
  getLocations,
  getLocationById,
  getFeaturedLocations,
  getCountries,
};
