const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all jobs with optional filters
router.get('/', async (req, res) => {
  try {
    const { title, category, location, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (title) {
      query += ` AND title ILIKE $${paramCount}`;
      params.push(`%${title}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
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

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new job (admin/employer only)
router.post('/', async (req, res) => {
  try {
    const { title, description, category, location, salary, company_id } = req.body;
    
    const result = await db.query(
      'INSERT INTO jobs (title, description, category, location, salary, company_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [title, description, category, location, salary, company_id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
