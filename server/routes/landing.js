import express from 'express';
import * as landingService from '../services/landing.service.js';

const router = express.Router();

// Get all landing page data
router.get('/', async (req, res, next) => {
  try {
    const [stats, featured_candidates, featured_companies, featured_locations, countries] = 
      await Promise.all([
        landingService.getLandingStats(),
        landingService.getFeaturedCandidates(8),
        landingService.getFeaturedCompanies(10),
        landingService.getFeaturedLocations(10),
        landingService.getCountries(),
      ]);

    res.json({
      stats,
      featured_candidates,
      featured_companies,
      featured_locations,
      countries,
    });
  } catch (error) {
    next(error);
  }
});

// Get statistics only
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await landingService.getLandingStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get featured candidates
router.get('/candidates', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 50);
    const candidates = await landingService.getFeaturedCandidates(limit);
    res.json(candidates);
  } catch (error) {
    next(error);
  }
});

// Get featured companies
router.get('/companies', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const companies = await landingService.getFeaturedCompanies(limit);
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// Get featured locations
router.get('/locations', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const locations = await landingService.getFeaturedLocations(limit);
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

// Get countries
router.get('/countries', async (req, res, next) => {
  try {
    const countries = await landingService.getCountries();
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

export default router;
