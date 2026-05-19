import { query } from '../config/database.js';

export const getAllJobs = async (offset = 0, limit = 10, filters = {}) => {
  let sql = `
    SELECT 
      j.id, j.title, j.description, j.location, j.company_id, 
      j.salary_min, j.salary_max, j.job_type, j.experience_level,
      j.posted_date, j.deadline, j.featured,
      c.company_name, c.logo_url
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;

  if (filters.jobType) {
    sql += ` AND j.job_type = $${paramIndex}`;
    params.push(filters.jobType);
    paramIndex++;
  }

  if (filters.location) {
    sql += ` AND j.location ILIKE $${paramIndex}`;
    params.push(`%${filters.location}%`);
    paramIndex++;
  }

  if (filters.experienceLevel) {
    sql += ` AND j.experience_level = $${paramIndex}`;
    params.push(filters.experienceLevel);
    paramIndex++;
  }

  if (filters.featured === true) {
    sql += ` AND j.featured = true`;
  }

  sql += ` ORDER BY j.posted_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getJobCount = async (filters = {}) => {
  let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.jobType) {
    sql += ` AND job_type = $${paramIndex}`;
    params.push(filters.jobType);
    paramIndex++;
  }

  if (filters.location) {
    sql += ` AND location ILIKE $${paramIndex}`;
    params.push(`%${filters.location}%`);
    paramIndex++;
  }

  const result = await query(sql, params);
  return parseInt(result.rows[0].count, 10);
};

export const getJobById = async (id) => {
  const sql = `
    SELECT 
      j.id, j.title, j.description, j.location, j.company_id,
      j.salary_min, j.salary_max, j.job_type, j.experience_level,
      j.posted_date, j.deadline, j.featured,
      c.company_name, c.logo_url, c.description as company_description
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.id = $1
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const getFeaturedJobs = async (limit = 10) => {
  const sql = `
    SELECT 
      j.id, j.title, j.description, j.location, j.company_id,
      j.salary_min, j.salary_max, j.job_type,
      c.company_name, c.logo_url
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.featured = true
    ORDER BY j.posted_date DESC
    LIMIT $1
  `;
  
  const result = await query(sql, [limit]);
  return result.rows;
};
