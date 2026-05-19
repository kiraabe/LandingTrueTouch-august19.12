import { query } from '../config/database.js';

export const getAllBlogs = async (offset = 0, limit = 10, filters = {}) => {
  let sql = `
    SELECT 
      b.id, b.title, b.slug, b.excerpt, b.content, b.author,
      b.image_url, b.published_date, b.featured,
      COUNT(c.id) as comments_count
    FROM blogs b
    LEFT JOIN blog_comments c ON b.id = c.blog_id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (filters.author) {
    sql += ` AND b.author ILIKE $${paramIndex}`;
    params.push(`%${filters.author}%`);
    paramIndex++;
  }

  if (filters.featured === true) {
    sql += ` AND b.featured = true`;
  }

  sql += ` GROUP BY b.id ORDER BY b.published_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

export const getBlogCount = async (filters = {}) => {
  let sql = 'SELECT COUNT(*) as count FROM blogs WHERE 1=1';

  if (filters.featured === true) {
    sql += ` AND featured = true`;
  }

  const result = await query(sql);
  return parseInt(result.rows[0].count, 10);
};

export const getBlogById = async (id) => {
  const sql = `
    SELECT 
      b.id, b.title, b.slug, b.excerpt, b.content, b.author,
      b.image_url, b.published_date, b.featured, b.created_at, b.updated_at
    FROM blogs b
    WHERE b.id = $1
  `;

  const result = await query(sql, [id]);
  const blog = result.rows[0];

  if (!blog) return null;

  const commentsResult = await query(
    `SELECT id, author, content, created_at FROM blog_comments WHERE blog_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  return {
    ...blog,
    comments: commentsResult.rows,
  };
};

export const getBlogBySlug = async (slug) => {
  const sql = `
    SELECT 
      b.id, b.title, b.slug, b.excerpt, b.content, b.author,
      b.image_url, b.published_date, b.featured, b.created_at, b.updated_at
    FROM blogs b
    WHERE b.slug = $1
  `;

  const result = await query(sql, [slug]);
  return result.rows[0] || null;
};

export const getFeaturedBlogs = async (limit = 5) => {
  const sql = `
    SELECT 
      b.id, b.title, b.slug, b.excerpt, b.image_url, b.author, b.published_date
    FROM blogs b
    WHERE b.featured = true
    ORDER BY b.published_date DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);
  return result.rows;
};
