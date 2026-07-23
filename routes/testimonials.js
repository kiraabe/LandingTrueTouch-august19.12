const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/testimonials', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, testimonial_text, company_name, designation, rating, avatar_image FROM testimonials WHERE LOWER(COALESCE(status, 'active')) = 'active' ORDER BY display_order ASC NULLS LAST, id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

module.exports = router;
