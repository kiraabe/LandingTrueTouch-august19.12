import * as candidatesQueries from '../queries/candidates.js';
import { getPaginationParams, buildPaginatedResponse, buildSuccessResponse } from '../utils/helpers.js';

export const getCandidates = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const filters = {
      location: req.query.location,
      experienceYears: req.query.experienceYears ? parseInt(req.query.experienceYears) : null,
      featured: req.query.featured === 'true',
    };

    const [candidates, total] = await Promise.all([
      candidatesQueries.getAllCandidates(offset, limit, filters),
      candidatesQueries.getCandidateCount(filters),
    ]);

    res.json(buildPaginatedResponse(candidates, page, limit, total));
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await candidatesQueries.getCandidateById(id);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(buildSuccessResponse(candidate));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCandidates = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    console.log(`[getFeaturedCandidates] Fetching ${limit} featured candidates...`);
    const candidates = await candidatesQueries.getFeaturedCandidates(limit);
    console.log(`[getFeaturedCandidates] Found ${candidates.length} candidates`);

    res.json(buildSuccessResponse(candidates));
  } catch (error) {
    console.error(`[getFeaturedCandidates] Error:`, error.message);
    next(error);
  }
};
