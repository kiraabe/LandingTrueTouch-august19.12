import * as blogsQueries from '../queries/blogs.js';
import { getPaginationParams, buildPaginatedResponse, buildSuccessResponse } from '../utils/helpers.js';

export const getBlogs = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const filters = {
      author: req.query.author,
      featured: req.query.featured === 'true',
    };

    const [blogs, total] = await Promise.all([
      blogsQueries.getAllBlogs(offset, limit, filters),
      blogsQueries.getBlogCount(filters),
    ]);

    res.json(buildPaginatedResponse(blogs, page, limit, total));
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await blogsQueries.getBlogById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(buildSuccessResponse(blog));
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await blogsQueries.getBlogBySlug(slug);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(buildSuccessResponse(blog));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedBlogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const blogs = await blogsQueries.getFeaturedBlogs(limit);

    res.json(buildSuccessResponse(blogs));
  } catch (error) {
    next(error);
  }
};
