import express from 'express';
import * as jobsController from '../controllers/jobsController.js';

const router = express.Router();

router.get('/', jobsController.getJobs);
router.get('/featured', jobsController.getFeaturedJobs);
router.get('/:id', jobsController.getJobById);

export default router;
