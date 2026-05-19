import * as jobsQueries from '../queries/jobs.js';
import { getPaginationParams, buildPaginatedResponse, buildSuccessResponse } from '../utils/helpers.js';

export const getJobs = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const filters = {
      jobType: req.query.jobType,
      location: req.query.location,
      experienceLevel: req.query.experienceLevel,
      featured: req.query.featured === 'true',
    };

    const [jobs, total] = await Promise.all([
      jobsQueries.getAllJobs(offset, limit, filters),
      jobsQueries.getJobCount(filters),
    ]);

    res.json(buildPaginatedResponse(jobs, page, limit, total));
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobsQueries.getJobById(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(buildSuccessResponse(job));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedJobs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const jobs = await jobsQueries.getFeaturedJobs(limit);

    res.json(buildSuccessResponse(jobs));
  } catch (error) {
    next(error);
  }
};
