import express from 'express';
import landingRouter from './landing.js';
import candidatesRouter from './candidates.js';
import jobsRouter from './jobs.js';
import companiesRouter from './companies.js';
import locationsRouter from './locations.js';
import blogsRouter from './blogs.js';
import contactRouter from './contact.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Landing page data
router.use('/landing', landingRouter);

// Candidates endpoints
router.use('/candidates', candidatesRouter);

// Jobs endpoints
router.use('/jobs', jobsRouter);

// Companies endpoints
router.use('/companies', companiesRouter);

// Locations endpoints
router.use('/locations', locationsRouter);

// Blogs endpoints
router.use('/blogs', blogsRouter);

// Contact form
router.use('/contact', contactRouter);

export default router;
