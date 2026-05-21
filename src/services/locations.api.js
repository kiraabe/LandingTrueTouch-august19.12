import apiClient from './api.js';

export const locationsAPI = {
  getList: async (params = {}) => {
    const { limit = 20, offset = 0, search = '', country = '' } = params;
    const response = await apiClient.get('/locations', {
      params: { limit, offset, search, country },
    });
    return response.data;
  },

  getFeatured: async (limit = 10) => {
    const response = await apiClient.get('/locations/featured', { params: { limit } });
    return response.data;
  },

  getCountries: async () => {
    const response = await apiClient.get('/locations/countries');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/locations/${id}`);
    return response.data;
  },
};

export default locationsAPI;
