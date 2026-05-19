import apiClient from './api.js';

export const jobsService = {
  getJobs: (params = {}) =>
    apiClient.get('/jobs', { params }),

  getJobById: (id) =>
    apiClient.get(`/jobs/${id}`),

  getFeaturedJobs: (limit = 10) =>
    apiClient.get('/jobs/featured', { params: { limit } }),

  searchJobs: (query, params = {}) =>
    apiClient.get('/jobs', { params: { ...params, q: query } }),
};

export default jobsService;
