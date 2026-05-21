import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Submit contact form (read-only - just acknowledge, can log to DB if permitted)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'subject', 'message']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Log to console (production should use logging service)
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
