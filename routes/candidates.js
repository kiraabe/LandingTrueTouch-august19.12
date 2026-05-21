const express = require('express');
const pool = require('../db');

const router = express.Router();

const mockCandidates = [
  { id: 1, full_name: 'Wanda Smith', job_title: 'Chartered Accountant', location: 'New York', profile_picture: 'images/candidates/pic1.jpg', hourly_rate: 20, rate_type: 'Day', featured: true },
  { id: 2, full_name: 'Peter Hawkins', job_title: 'Medical Professional', location: 'New York', profile_picture: 'images/candidates/pic2.jpg', hourly_rate: 7, rate_type: 'Hour', featured: true },
  { id: 3, full_name: 'Ralph Johnson', job_title: 'Bank Manager', location: 'New York', profile_picture: 'images/candidates/pic3.jpg', hourly_rate: 180, rate_type: 'Day', featured: true },
  { id: 4, full_name: 'Randall Henderson', job_title: 'IT Contractor', location: 'New York', profile_picture: 'images/candidates/pic4.jpg', hourly_rate: 90, rate_type: 'Week', featured: true },
  { id: 5, full_name: 'Randall Warren', job_title: 'Digital & Creative', location: 'New York', profile_picture: 'images/candidates/pic5.jpg', hourly_rate: 95, rate_type: 'Day', featured: true },
  { id: 6, full_name: 'Christina Fischer', job_title: 'Charity & Voluntary', location: 'New York', profile_picture: 'images/candidates/pic6.jpg', hourly_rate: 19, rate_type: 'Hour', featured: true },
  { id: 7, full_name: 'Wanda Willis', job_title: 'Marketing & PR', location: 'New York', profile_picture: 'images/candidates/pic7.jpg', hourly_rate: 12, rate_type: 'Day', featured: true },
  { id: 8, full_name: 'Peter Hawkins', job_title: 'Public Sector', location: 'New York', profile_picture: 'images/candidates/pic8.jpg', hourly_rate: 7, rate_type: 'Hour', featured: true }
];

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates WHERE featured = true LIMIT 8');
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    console.log('Using mock candidates data instead');
    res.json(mockCandidates);
  }
});

module.exports = router;
