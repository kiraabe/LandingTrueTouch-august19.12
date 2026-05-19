import express from 'express';
import * as candidatesController from '../controllers/candidatesController.js';

const router = express.Router();

router.get('/', candidatesController.getCandidates);
router.get('/featured', candidatesController.getFeaturedCandidates);
router.get('/:id', candidatesController.getCandidateById);

export default router;
