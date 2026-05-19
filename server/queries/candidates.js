import { query } from '../config/database.js';

export const getAllCandidates = async (offset = 0, limit = 10, filters = {}) => {
  let sql = `
    SELECT 
      c.id, c.name, c.title, c.email, c.phone, c.location,
      c.experience_years, c.profile_image_url, c.bio, c.featured,
      c.created_at, COUNT(s.id) as skills_count
    FROM candidates c
    LEFT JOIN candidate_skills s ON c.id = s.candidate_id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (filters.location) {
    sql += ` AND c.location ILIKE $${paramIndex}`;
    params.push(`%${filters.location}%`);
    paramIndex++;
  }

  if (filters.experienceYears) {
    sql += ` AND c.experience_years >= $${paramIndex}`;
    params.push(filters.experienceYears);
    paramIndex++;
  }

  if (filters.featured === true) {
    sql += ` AND c.featured = true`;
  }

  sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getCandidateCount = async (filters = {}) => {
  let sql = 'SELECT COUNT(DISTINCT c.id) as count FROM candidates c WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.location) {
    sql += ` AND c.location ILIKE $${paramIndex}`;
    params.push(`%${filters.location}%`);
    paramIndex++;
  }

  const result = await query(sql, params);
  return parseInt(result.rows[0].count, 10);
};

export const getCandidateById = async (id) => {
  const sql = `
    SELECT 
      c.id, c.name, c.title, c.email, c.phone, c.location,
      c.experience_years, c.profile_image_url, c.bio, c.featured,
      c.created_at, c.updated_at
    FROM candidates c
    WHERE c.id = $1
  `;

  const result = await query(sql, [id]);
  const candidate = result.rows[0];

  if (!candidate) return null;

  const skillsResult = await query(
    `SELECT skill FROM candidate_skills WHERE candidate_id = $1`,
    [id]
  );

  return {
    ...candidate,
    skills: skillsResult.rows.map(r => r.skill),
  };
};

export const getFeaturedCandidates = async (limit = 10) => {
  const sql = `
    SELECT 
      c.id, c.name, c.title, c.location, c.experience_years,
      c.profile_image_url, c.bio
    FROM candidates c
    WHERE c.featured = true
    ORDER BY c.created_at DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);
  return result.rows;
};
