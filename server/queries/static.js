import { query } from '../config/database.js';

export const getCountries = async () => {
  const sql = `
    SELECT id, name, code FROM countries ORDER BY name ASC
  `;
  const result = await query(sql);
  return result.rows;
};

export const getLocations = async (filters = {}) => {
  let sql = `
    SELECT id, name, country_id FROM locations WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;

  if (filters.countryId) {
    sql += ` AND country_id = $${paramIndex}`;
    params.push(filters.countryId);
    paramIndex++;
  }

  sql += ` ORDER BY name ASC`;

  const result = await query(sql, params);
  return result.rows;
};

export const getLocationsByCountry = async (countryId) => {
  const sql = `
    SELECT id, name FROM locations 
    WHERE country_id = $1 
    ORDER BY name ASC
  `;
  const result = await query(sql, [countryId]);
  return result.rows;
};

export const getStatistics = async () => {
  const stats = {};

  const jobsResult = await query('SELECT COUNT(*) as count FROM jobs');
  stats.totalJobs = parseInt(jobsResult.rows[0].count, 10);

  const candidatesResult = await query('SELECT COUNT(*) as count FROM candidates');
  stats.totalCandidates = parseInt(candidatesResult.rows[0].count, 10);

  const companiesResult = await query('SELECT COUNT(*) as count FROM companies');
  stats.totalCompanies = parseInt(companiesResult.rows[0].count, 10);

  const filledPositionsResult = await query(
    'SELECT COUNT(*) as count FROM jobs WHERE status = \'filled\''
  );
  stats.filledPositions = parseInt(filledPositionsResult.rows[0].count, 10);

  return stats;
};

export const getTestimonials = async (limit = 10) => {
  const sql = `
    SELECT 
      id, client_name, client_title, client_image_url, 
      message, rating, created_at
    FROM testimonials
    ORDER BY created_at DESC
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
};

export const getCompanies = async (offset = 0, limit = 10) => {
  const sql = `
    SELECT 
      id, company_name, logo_url, description, industry,
      location, website, created_at,
      COUNT(j.id) as total_jobs
    FROM companies c
    LEFT JOIN jobs j ON c.id = j.company_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await query(sql, [limit, offset]);
  return result.rows;
};

export const getCompanyCount = async () => {
  const sql = 'SELECT COUNT(*) as count FROM companies';
  const result = await query(sql);
  return parseInt(result.rows[0].count, 10);
};

export const getCompanyById = async (id) => {
  const sql = `
    SELECT 
      id, company_name, logo_url, description, industry,
      location, website, phone, email, created_at
    FROM companies
    WHERE id = $1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};
