import express from 'express';
import * as staticController from '../controllers/staticController.js';

const router = express.Router();

router.get('/countries', staticController.getCountries);
router.get('/locations', staticController.getLocations);
router.get('/locations/:countryId', staticController.getLocationsByCountry);
router.get('/statistics', staticController.getStatistics);
router.get('/testimonials', staticController.getTestimonials);
router.get('/companies', staticController.getCompanies);
router.get('/companies/:id', staticController.getCompanyById);

export default router;
