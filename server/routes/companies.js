import express from 'express';
import * as companiesService from '../services/companies.service.js';

const router = express.Router();

// Get all companies with pagination
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search || '';

    const companies = await companiesService.getCompanies({
      limit,
      offset,
      search,
    });

    res.json({
      data: companies,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get featured companies
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const companies = await companiesService.getFeaturedCompanies(limit);
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// Get single company by ID
router.get('/:id', async (req, res, next) => {
  try {
    const company = await companiesService.getCompanyById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

export default router;
