import express from 'express';
import * as blogsController from '../controllers/blogsController.js';

const router = express.Router();

router.get('/', blogsController.getBlogs);
router.get('/featured', blogsController.getFeaturedBlogs);
router.get('/by-slug/:slug', blogsController.getBlogBySlug);
router.get('/:id', blogsController.getBlogById);

export default router;
