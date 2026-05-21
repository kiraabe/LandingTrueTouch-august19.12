const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, status AS featured FROM candidates WHERE profile_picture IS NOT NULL LIMIT 8'
    );
    console.log('Raw profile_picture samples:', result.rows.map(r => r.profile_picture).slice(0, 2));
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

module.exports = router;
