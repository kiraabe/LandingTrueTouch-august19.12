import { query } from '../config/database.js';

// Get landing page statistics
export const getLandingStats = async () => {
  try {
    const jobResult = await query(`SELECT COUNT(*) as total FROM jobs WHERE status = 'active'`);
    const candidateResult = await query(`SELECT COUNT(*) as total FROM candidates WHERE is_active = true`);
    const companyResult = await query(`SELECT COUNT(*) as total FROM employers WHERE is_active = true`);

    return {
      total_jobs: parseInt(jobResult.rows[0]?.total || 0),
      total_candidates: parseInt(candidateResult.rows[0]?.total || 0),
      total_companies: parseInt(companyResult.rows[0]?.total || 0),
    };
  } catch (error) {
    console.error('Error getting landing stats:', error.message);
    return {
      total_jobs: 0,
      total_candidates: 0,
      total_companies: 0,
    };
  }
};

// Get featured candidates
export const getFeaturedCandidates = async (limit = 8) => {
  try {
    const result = await query(`
      SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.title,
        c.location,
        c.expected_salary,
        c.profile_image,
        c.is_featured
      FROM candidates c
      WHERE c.is_featured = true AND c.is_active = true
      ORDER BY c.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured candidates:', error.message);
    return [];
  }
};

// Get featured companies/employers
export const getFeaturedCompanies = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT
        e.id,
        e.company_name,
        e.logo_path,
        e.website,
        e.is_featured
      FROM employers e
      WHERE e.is_featured = true AND e.is_active = true
      ORDER BY e.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured companies:', error.message);
    return [];
  }
};

// Get featured locations
export const getFeaturedLocations = async (limit = 10) => {
  try {
    const result = await query(`
      SELECT
        l.id,
        l.name,
        l.country,
        l.image_path,
        COUNT(j.id) as job_count
      FROM locations l
      LEFT JOIN jobs j ON l.id = j.location_id AND j.status = 'active'
      WHERE l.is_featured = true
      GROUP BY l.id, l.name, l.country, l.image_path
      ORDER BY job_count DESC
      LIMIT $1
    `, [limit]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting featured locations:', error.message);
    return [];
  }
};

// Get all countries
export const getCountries = async () => {
  try {
    const result = await query(`
      SELECT DISTINCT country FROM locations
      WHERE country IS NOT NULL
      ORDER BY country ASC
    `);
    return result.rows?.map(row => row.country) || [];
  } catch (error) {
    console.error('Error getting countries:', error.message);
    return [];
  }
};

export default {
  getLandingStats,
  getFeaturedCandidates,
  getFeaturedCompanies,
  getFeaturedLocations,
  getCountries,
};
