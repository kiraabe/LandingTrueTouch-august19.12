import express from 'express';
import * as blogsService from '../services/blogs.service.js';

const router = express.Router();

// Get all blogs with pagination
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search || '';

    const blogs = await blogsService.getBlogs({
      limit,
      offset,
      search,
    });

    res.json({
      data: blogs,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get latest blogs
router.get('/latest', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const blogs = await blogsService.getLatestBlogs(limit);
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

// Get single blog by ID
router.get('/:id', async (req, res, next) => {
  try {
    const blog = await blogsService.getBlogById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    next(error);
  }
});

export default router;
