import apiClient from './api.js';

export const jobsAPI = {
  getList: async (params = {}) => {
    const { limit = 20, offset = 0, search = '', location = '', company = '' } = params;
    const response = await apiClient.get('/jobs', {
      params: { limit, offset, search, location, company },
    });
    return response.data;
  },

  getFeatured: async (limit = 10) => {
    const response = await apiClient.get('/jobs/featured', { params: { limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },
};

export default jobsAPI;
