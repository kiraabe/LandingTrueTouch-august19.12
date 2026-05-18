const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  // Jobs endpoints
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/jobs?${queryString}`);
    return response.json();
  },

  getJobById: async (id) => {
    const response = await fetch(`${API_URL}/jobs/${id}`);
    return response.json();
  },

  createJob: async (jobData) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    return response.json();
  },

  // Candidates endpoints
  getCandidates: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/candidates?${queryString}`);
    return response.json();
  },

  getCandidateById: async (id) => {
    const response = await fetch(`${API_URL}/candidates/${id}`);
    return response.json();
  },

  createCandidate: async (candidateData) => {
    const response = await fetch(`${API_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData),
    });
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  },
};

export default api;
