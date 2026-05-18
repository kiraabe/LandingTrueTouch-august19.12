const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all candidates with optional filters
router.get('/', async (req, res) => {
  try {
    const { title, location, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (title) {
      query += ` AND profession ILIKE $${paramCount}`;
      params.push(`%${title}%`);
      paramCount++;
    }

    if (location) {
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST disabled - Database is read-only
router.post('/', (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Database is read-only. Cannot create candidates.',
    message: 'Use the admin panel to create candidates'
  });
});

module.exports = router;
