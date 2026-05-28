const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/blogs/latest', async (req, res) => {
  try {
    // Check if blogs table exists
    const tableExists = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'blogs'"
    );

    if (tableExists.rows.length === 0) {
      console.log('⚠ Blogs table does not exist, returning empty array');
      return res.json([]);
    }

    const limit = req.query.limit || 3;
    const result = await pool.query(
      'SELECT id, title, author, created_at, image_url FROM blogs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    console.log('✓ Fetched latest blogs, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM blogs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    console.log('✓ Fetched blog with id:', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

router.get('/blogs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, author, created_at, image_url FROM blogs ORDER BY created_at DESC'
    );
    console.log('✓ Fetched all blogs, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

module.exports = router;
