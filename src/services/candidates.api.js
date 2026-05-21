import apiClient from './api.js';

export const candidatesAPI = {
  getList: async (params = {}) => {
    const { limit = 20, offset = 0, search = '', location = '' } = params;
    const response = await apiClient.get('/candidates', {
      params: { limit, offset, search, location },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },
};

export default candidatesAPI;
