import apiClient from './api.js';

export const blogsService = {
  getBlogs: (params = {}) =>
    apiClient.get('/blogs', { params }),

  getBlogById: (id) =>
    apiClient.get(`/blogs/${id}`),

  getBlogBySlug: (slug) =>
    apiClient.get(`/blogs/by-slug/${slug}`),

  getFeaturedBlogs: (limit = 5) =>
    apiClient.get('/blogs/featured', { params: { limit } }),

  searchBlogs: (query, params = {}) =>
    apiClient.get('/blogs', { params: { ...params, q: query } }),
};

export default blogsService;
