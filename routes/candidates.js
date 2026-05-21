const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, status AS featured FROM candidates LIMIT 8'
    );
    const candidates = result.rows.map((candidate, index) => {
      let imageUrl = 'images/candidates/pic1.jpg';
      if (candidate.profile_picture) {
        // If it's a relative path (starts with /), make it absolute
        if (candidate.profile_picture.startsWith('/')) {
          imageUrl = `http://localhost:5000${candidate.profile_picture}`;
        } else {
          imageUrl = candidate.profile_picture;
        }
      } else {
        // Use placeholder based on index if no image
        const picNum = (index % 8) + 1;
        imageUrl = `images/candidates/pic${picNum}.jpg`;
      }
      return {
        ...candidate,
        profile_picture: imageUrl
      };
    });
    console.log('Fetched candidates:', candidates.length);
    res.json(candidates);
  } catch (error) {
    console.error('Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

module.exports = router;
