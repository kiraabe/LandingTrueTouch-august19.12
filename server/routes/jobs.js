import express from 'express';
import * as jobsService from '../services/jobs.service.js';

const router = express.Router();

// Get all jobs with pagination
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search || '';
    const location = req.query.location || '';
    const company = req.query.company || '';

    const jobs = await jobsService.getJobs({
      limit,
      offset,
      search,
      location,
      company,
    });

    const total = await jobsService.getJobCount();

    res.json({
      data: jobs,
      pagination: {
        limit,
        offset,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get featured jobs
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const jobs = await jobsService.getFeaturedJobs(limit);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// Get single job by ID
router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobsService.getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
});

export default router;
