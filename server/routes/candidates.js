import express from 'express';
import * as candidatesService from '../services/candidates.service.js';

const router = express.Router();

// Get all candidates with pagination
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search || '';
    const location = req.query.location || '';

    const candidates = await candidatesService.getCandidates({
      limit,
      offset,
      search,
      location,
    });

    const total = await candidatesService.getCandidateCount();

    res.json({
      data: candidates,
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

// Get single candidate by ID
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await candidatesService.getCandidateById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
});

export default router;
