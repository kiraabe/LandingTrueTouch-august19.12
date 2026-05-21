import apiClient from './api.js';

export const blogsAPI = {
  getList: async (params = {}) => {
    const { limit = 20, offset = 0, search = '' } = params;
    const response = await apiClient.get('/blogs', {
      params: { limit, offset, search },
    });
    return response.data;
  },

  getLatest: async (limit = 10) => {
    const response = await apiClient.get('/blogs/latest', { params: { limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/blogs/${id}`);
    return response.data;
  },
};

export default blogsAPI;
