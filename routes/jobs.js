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

    // Get all columns from jobs table
    const columnsResult = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs' ORDER BY ordinal_position"
    );
    const columns = columnsResult.rows.map(row => row.column_name);
    console.log('✓ Jobs table columns:', columns);

    // Fetch all data from jobs table (we'll transform it on the backend)
    const limit = req.query.limit || 3;
    const result = await pool.query(
      'SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    console.log('✓ Fetched latest jobs, count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✓ Sample job keys:', Object.keys(result.rows[0]));
      console.log('✓ Sample job data:', result.rows[0]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

// Get single job/blog by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📡 Fetching job with id:', id);

    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 OR id::text = $1',
      [id]
    );

    if (result.rows.length === 0) {
      console.log('Job not found for id:', id);
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('✓ Fetched job with id:', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

module.exports = router;
