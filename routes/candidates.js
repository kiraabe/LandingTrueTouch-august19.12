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

router.get('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching candidate with ID: ${id}`);

    const result = await pool.query(
      'SELECT * FROM candidates WHERE id = $1',
      [id]
    );

    console.log(`Query result for candidate ${id}:`, result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log(`Candidate ${id} not found`);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = result.rows[0];
    const response = {
      id: candidate.id,
      full_name: candidate.name || candidate.full_name,
      job_title: candidate.job_category || candidate.job_title,
      location: candidate.current_location || candidate.location,
      profile_picture: candidate.profile_picture,
      hourly_rate: candidate.religion || candidate.hourly_rate,
      bio: candidate.bio,
      skills: candidate.skills,
      experience: candidate.experience,
      education: candidate.education,
      portfolio: candidate.portfolio,
      about: candidate.bio
    };

    res.json(response);
  } catch (error) {
    console.error('Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidate', details: error.message });
  }
});

module.exports = router;
