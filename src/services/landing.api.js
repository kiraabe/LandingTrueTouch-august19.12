import apiClient from './api.js';

export const landingAPI = {
  getAll: async () => {
    const response = await apiClient.get('/landing');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/landing/stats');
    return response.data;
  },

  getFeaturedCandidates: async (limit = 8) => {
    const response = await apiClient.get('/landing/candidates', { params: { limit } });
    return response.data;
  },

  getFeaturedCompanies: async (limit = 10) => {
    const response = await apiClient.get('/landing/companies', { params: { limit } });
    return response.data;
  },

  getFeaturedLocations: async (limit = 10) => {
    const response = await apiClient.get('/landing/locations', { params: { limit } });
    return response.data;
  },

  getCountries: async () => {
    const response = await apiClient.get('/landing/countries');
    return response.data;
  },
};

export default landingAPI;
