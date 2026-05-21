import { query } from '../config/database.js';

export const getJobs = async (filters = {}) => {
  try {
    const { limit = 20, offset = 0, search = '', location = '', company = '' } = filters;

    let sql = 'SELECT * FROM jobs WHERE status = \'active\'';
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (location) {
      sql += ` AND location_id IN (SELECT id FROM locations WHERE name = $${paramCount})`;
      params.push(location);
      paramCount++;
    }

    if (company) {
      sql += ` AND employer_id IN (SELECT id FROM employers WHERE company_name = $${paramCount})`;
      params.push(company);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting jobs:', error.message);
    return [];
  }
};

export const getJobById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM jobs WHERE id = $1 AND status = \'active\'',
      [id]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting job:', error.message);
    return null;
  }
};

export const getJobCount = async () => {
  try {
    const result = await query('SELECT COUNT(*) as total FROM jobs WHERE status = \'active\'');
    return parseInt(result.rows?.[0]?.total || 0);
  } catch (error) {
    console.error('Error getting job count:', error.message);
    return 0;
  }
};

export const getFeaturedJobs = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT * FROM jobs
      WHERE status = 'active' AND is_featured = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured jobs:', error.message);
    return [];
  }
};

export default {
  getJobs,
  getJobById,
  getJobCount,
  getFeaturedJobs,
};
