import express from 'express';
import jobsRouter from './jobs.js';
import candidatesRouter from './candidates.js';
import blogsRouter from './blogs.js';
import staticRouter from './static.js';

const router = express.Router();

router.use('/jobs', jobsRouter);
router.use('/candidates', candidatesRouter);
router.use('/blogs', blogsRouter);
router.use('/static', staticRouter);

export default router;
