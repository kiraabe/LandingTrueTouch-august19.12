const express = require('express');
const pool = require('../db');

const router = express.Router();

// Submit contact form
router.post('/contact-us', async (req, res) => {
  try {
    const { username, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO contact_us (username, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, phone, subject, message]
    );

    console.log('✓ Contact form submitted:', result.rows[0].id);
    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will contact you soon.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('✗ Error submitting contact form:', error.message);
    res.status(500).json({ error: 'Failed to submit contact form', details: error.message });
  }
});

// Get all contact submissions (for admin)
router.get('/contact-us', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_us ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Error fetching contact submissions:', error.message);
    res.status(500).json({ error: 'Failed to fetch contact submissions', details: error.message });
  }
});

// Debug: Check if table exists
router.get('/contact-us/debug', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'contact_us')"
    );
    const tableExists = result.rows[0].exists;

    if (tableExists) {
      const countResult = await pool.query('SELECT COUNT(*) FROM contact_us');
      res.json({
        table_exists: true,
        message: 'contact_us table exists',
        total_records: parseInt(countResult.rows[0].count)
      });
    } else {
      res.json({
        table_exists: false,
        message: 'contact_us table does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
