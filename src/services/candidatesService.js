import apiClient from './api.js';

export const candidatesService = {
  getCandidates: (params = {}) =>
    apiClient.get('/candidates', { params }),

  getCandidateById: (id) =>
    apiClient.get(`/candidates/${id}`),

  getFeaturedCandidates: (limit = 10) =>
    apiClient.get('/candidates/featured', { params: { limit } }),

  searchCandidates: (query, params = {}) =>
    apiClient.get('/candidates', { params: { ...params, q: query } }),
};

export default candidatesService;
