import apiClient from './api.js';

export const companiesAPI = {
  getList: async (params = {}) => {
    const { limit = 20, offset = 0, search = '' } = params;
    const response = await apiClient.get('/companies', {
      params: { limit, offset, search },
    });
    return response.data;
  },

  getFeatured: async (limit = 10) => {
    const response = await apiClient.get('/companies/featured', { params: { limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },
};

export default companiesAPI;
