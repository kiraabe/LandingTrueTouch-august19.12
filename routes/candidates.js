const express = require('express');
const pool = require('../db');

const router = express.Router();

// Specific routes BEFORE parameterized routes
router.get('/candidates/debug', async (req, res) => {
  try {
    console.log('✓ Debug endpoint hit');
    const tableExists = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'candidates'"
    );

    if (tableExists.rows.length === 0) {
      return res.status(500).json({ error: 'Candidates table does not exist' });
    }

    const allCandidates = await pool.query('SELECT id, name FROM candidates ORDER BY id');
    console.log(`✓ Found ${allCandidates.rows.length} candidates`);
    res.json({
      table_exists: true,
      total_candidates: allCandidates.rows.length,
      candidate_ids: allCandidates.rows.map(c => c.id),
      sample: allCandidates.rows.slice(0, 5)
    });
  } catch (error) {
    console.error('✗ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/candidates/list-all', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM candidates ORDER BY id LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates list', details: error.message });
  }
});

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, status AS featured FROM candidates WHERE profile_picture IS NOT NULL LIMIT 8'
    );
    console.log('✓ Fetched featured candidates, count:', result.rows.length);
    console.log('✓ Sample IDs:', result.rows.map(r => r.id).slice(0, 2));
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Parameterized route - AFTER specific routes
router.get('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📌 Fetching candidate with ID: ${id}`);

    if (!id) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const result = await pool.query(
      'SELECT * FROM candidates WHERE id = $1',
      [id]
    );

    console.log(`✓ Query result for candidate ${id}:`, result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log(`✗ Candidate ${id} not found in database`);
      return res.status(404).json({ error: `Candidate not found with ID: ${id}` });
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
      about: candidate.bio || candidate.about
    };

    console.log(`✓ Returning candidate:`, response.full_name);
    res.json(response);
  } catch (error) {
    console.error('✗ Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate', details: error.message });
  }
});

module.exports = router;
