const express = require('express');
const pool = require('../db');

const router = express.Router();

// Specific route BEFORE parameterized routes
router.get('/blogs/latest', async (req, res) => {
  try {
    const limit = req.query.limit || 3;
    const result = await pool.query(
      'SELECT id, title_en AS title, author_name AS author, publish_date AS created_at, featured_image AS image_url, excerpt_en AS description FROM blogs WHERE status IS NULL OR LOWER(TRIM(status)) <> \'draft\' ORDER BY publish_date DESC LIMIT $1',
      [limit]
    );
    console.log('✓ Fetched latest blogs, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get all blogs
router.get('/blogs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title_en AS title, author_name AS author, publish_date AS created_at, featured_image AS image_url, excerpt_en AS description FROM blogs WHERE status IS NULL OR LOWER(TRIM(status)) <> \'draft\' ORDER BY publish_date DESC'
    );
    console.log('✓ Fetched all blogs, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get single blog by ID - AFTER more specific routes
router.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📡 Fetching blog with id:', id);

    const result = await pool.query(
      'SELECT *, title_en AS title, author_name AS author, publish_date AS created_at, featured_image AS image_url, excerpt_en AS description, body_en AS content, author_bio_en AS author_bio FROM blogs WHERE id = $1 AND (status IS NULL OR LOWER(TRIM(status)) <> \'draft\')',
      [id]
    );

    if (result.rows.length === 0) {
      console.log('Blog not found for id:', id);
      return res.status(404).json({ error: 'Blog not found' });
    }

    console.log('✓ Fetched blog with id:', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blog', details: error.message });
  }
});

module.exports = router;
