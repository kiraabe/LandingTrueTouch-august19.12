const express = require('express');
const pool = require('../db');
const axios = require('axios');

const router = express.Router();

// Image proxy endpoint - serves images from external server
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(response.data);
  } catch (error) {
    console.error('✗ Image proxy error for URL:', error.config?.url, 'Error:', error.message);
    res.status(404).json({ error: 'Failed to fetch image', details: error.message });
  }
});

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

    const allCandidates = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id');
    console.log(`✓ Found ${allCandidates.rows.length} candidates`);
    res.json({
      table_exists: true,
      total_candidates: allCandidates.rows.length,
      candidate_uuids: allCandidates.rows.map(c => c.candidate_id),
      sample: allCandidates.rows.slice(0, 5)
    });
  } catch (error) {
    console.error('✗ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/candidates/list-all', async (req, res) => {
  try {
    const result = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates list', details: error.message });
  }
});

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT candidate_id AS id, id as numeric_id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, status AS featured FROM candidates WHERE profile_picture IS NOT NULL LIMIT 8'
    );
    console.log('✓ Fetched featured candidates, count:', result.rows.length);
    console.log('✓ Sample UUIDs:', result.rows.map(r => r.id).slice(0, 2));
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
    console.log(`📌 Fetching candidate with ID (UUID): ${id}`);

    if (!id) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const result = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [id]
    );

    console.log(`✓ Query result for candidate ${id}:`, result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log(`✗ Candidate ${id} not found in database`);
      return res.status(404).json({ error: `Candidate not found with ID: ${id}` });
    }

    const candidate = result.rows[0];
    console.log('📊 Full candidate row from DB:', JSON.stringify(candidate, null, 2));

    const response = {
      id: candidate.candidate_id,
      name: candidate.name,
      full_name: candidate.name,
      passport_number: candidate.passport_number,
      phone_number: candidate.phone_number,
      profile_picture: candidate.profile_picture,
      cv: candidate.cv,
      gender: candidate.gender,
      date_of_birth: candidate.date_of_birth,
      nationality: candidate.nationality,
      religion: candidate.religion,
      marital_status: candidate.marital_status,
      occupation: candidate.occupation,
      job_category: candidate.job_category,
      skill_level: candidate.skill_level,
      education_level: candidate.education_level,
      language_skills: candidate.language_skills,
      city: candidate.city,
      current_location: candidate.current_location,
      resume_url: candidate.resume_url,
      medical_status: candidate.medical_status,
      status: candidate.status,
      job_title: candidate.job_category,
      location: candidate.current_location,
      hourly_rate: candidate.hourly_rate,
      bio: candidate.occupation,
      skills: candidate.language_skills,
      experience: candidate.occupation,
      education: candidate.education_level,
      portfolio: candidate.resume_url,
      about: candidate.occupation
    };

    console.log(`✓ Returning candidate:`, response.full_name);
    res.json(response);
  } catch (error) {
    console.error('✗ Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate', details: error.message });
  }
});

module.exports = router;
