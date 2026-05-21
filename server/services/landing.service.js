import { query } from '../config/database.js';

// Get landing page statistics
export const getLandingStats = async () => {
  const result = await query(`
    SELECT 
      COUNT(DISTINCT j.id) as total_jobs,
      COUNT(DISTINCT c.id) as total_candidates,
      COUNT(DISTINCT com.id) as total_companies
    FROM jobs j
    CROSS JOIN candidates c
    CROSS JOIN companies com
    WHERE j.status = 'active'
  `);
  return result.rows[0];
};

// Get featured candidates
export const getFeaturedCandidates = async (limit = 8) => {
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
  return result.rows;
};

// Get featured companies/employers
export const getFeaturedCompanies = async (limit = 10) => {
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
  return result.rows;
};

// Get featured locations
export const getFeaturedLocations = async (limit = 10) => {
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
    GROUP BY l.id
    ORDER BY job_count DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

// Get all countries
export const getCountries = async () => {
  const result = await query(`
    SELECT DISTINCT country FROM locations
    WHERE country IS NOT NULL
    ORDER BY country ASC
  `);
  return result.rows.map(row => row.country);
};

export default {
  getLandingStats,
  getFeaturedCandidates,
  getFeaturedCompanies,
  getFeaturedLocations,
  getCountries,
};
