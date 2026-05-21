import express from 'express';
import * as locationsService from '../services/locations.service.js';

const router = express.Router();

// Get all locations with pagination
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search || '';
    const country = req.query.country || '';

    const locations = await locationsService.getLocations({
      limit,
      offset,
      search,
      country,
    });

    res.json({
      data: locations,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get featured locations
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const locations = await locationsService.getFeaturedLocations(limit);
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

// Get countries
router.get('/countries', async (req, res, next) => {
  try {
    const countries = await locationsService.getCountries();
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

// Get single location by ID
router.get('/:id', async (req, res, next) => {
  try {
    const location = await locationsService.getLocationById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    next(error);
  }
});

export default router;
