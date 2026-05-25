const express = require('express');
const pool = require('../db');

const router = express.Router();

// Debug endpoint to check jobs table structure
router.get('/jobs/debug', async (req, res) => {
  try {
    const result = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['jobs']);
    console.log('Jobs table columns:', result.rows);
    res.json({ columns: result.rows });
  } catch (error) {
    console.error('✗ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs/latest', async (req, res) => {
  try {
    // Check if jobs table exists
    const tableExists = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'jobs'"
    );

    if (tableExists.rows.length === 0) {
      console.log('⚠ Jobs table does not exist, returning empty array');
      return res.json([]);
    }

    const limit = req.query.limit || 3;
    const result = await pool.query(
      'SELECT id, title, author, created_at, image_url FROM jobs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    console.log('✓ Fetched latest jobs, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
