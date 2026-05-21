const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, status AS featured FROM candidates WHERE status = $1 LIMIT 8',
      ['available']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

module.exports = router;
