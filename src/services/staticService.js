import apiClient from './api.js';

export const staticService = {
  getCountries: () =>
    apiClient.get('/static/countries'),

  getLocations: (params = {}) =>
    apiClient.get('/static/locations', { params }),

  getLocationsByCountry: (countryId) =>
    apiClient.get(`/static/locations/${countryId}`),

  getStatistics: () =>
    apiClient.get('/static/statistics'),

  getTestimonials: (limit = 10) =>
    apiClient.get('/static/testimonials', { params: { limit } }),

  getCompanies: (params = {}) =>
    apiClient.get('/static/companies', { params }),

  getCompanyById: (id) =>
    apiClient.get(`/static/companies/${id}`),
};

export default staticService;
