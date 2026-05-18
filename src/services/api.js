const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fallback sample data when backend is unavailable
const fallbackJobs = [
  {
    id: 1,
    title: 'Senior Developer',
    description: 'We are looking for an experienced developer',
    category: 'Developer',
    location: 'Saudi Arabia',
    salary: '$5000-$7000',
    company_id: 1,
  },
  {
    id: 2,
    title: 'Web Designer',
    description: 'Creative web design position',
    category: 'Web Designer',
    location: 'Qatar',
    salary: '$3000-$5000',
    company_id: 1,
  },
  {
    id: 3,
    title: 'Business Analyst',
    description: 'Analyze business requirements',
    category: 'Business Analyst',
    location: 'Jordan',
    salary: '$4000-$6000',
    company_id: 2,
  },
];

const fallbackCandidates = [
  {
    id: 1,
    name: 'Wanda Smith',
    profession: 'Charted Accountant',
    location: 'New York',
    rate: '$20/Day',
    image_url: 'images/candidates/pic1.jpg',
  },
  {
    id: 2,
    name: 'Peter Hawkins',
    profession: 'Medical Professional',
    location: 'New York',
    rate: '$7/Hour',
    image_url: 'images/candidates/pic2.jpg',
  },
  {
    id: 3,
    name: 'Ralph Johnson',
    profession: 'Bank Manager',
    location: 'New York',
    rate: '$180/Day',
    image_url: 'images/candidates/pic3.jpg',
  },
  {
    id: 4,
    name: 'Randall Henderson',
    profession: 'IT Contractor',
    location: 'New York',
    rate: '$90/Week',
    image_url: 'images/candidates/pic4.jpg',
  },
  {
    id: 5,
    name: 'Randall Warren',
    profession: 'Digital & Creative',
    location: 'New York',
    rate: '$95/Day',
    image_url: 'images/candidates/pic5.jpg',
  },
  {
    id: 6,
    name: 'Christina Fischer',
    profession: 'Charity & Voluntary',
    location: 'New York',
    rate: '$19/Hour',
    image_url: 'images/candidates/pic6.jpg',
  },
  {
    id: 7,
    name: 'Wanda Willis',
    profession: 'Marketing & PR',
    location: 'New York',
    rate: '$12/Day',
    image_url: 'images/candidates/pic7.jpg',
  },
  {
    id: 8,
    name: 'Peter Hawkins',
    profession: 'Public Sector',
    location: 'New York',
    rate: '$7/Hour',
    image_url: 'images/candidates/pic8.jpg',
  },
];

const filterData = (data, params) => {
  let filtered = [...data];

  if (params.title) {
    const titleLower = params.title.toLowerCase();
    filtered = filtered.filter(item =>
      (item.title && item.title.toLowerCase().includes(titleLower)) ||
      (item.profession && item.profession.toLowerCase().includes(titleLower))
    );
  }

  if (params.category) {
    const categoryLower = params.category.toLowerCase();
    filtered = filtered.filter(item =>
      item.category && item.category.toLowerCase().includes(categoryLower)
    );
  }

  if (params.location) {
    const locationLower = params.location.toLowerCase();
    filtered = filtered.filter(item =>
      item.location && item.location.toLowerCase().includes(locationLower)
    );
  }

  const limit = parseInt(params.limit) || 10;
  const offset = parseInt(params.offset) || 0;

  return filtered.slice(offset, offset + limit);
};

const api = {
  // Jobs endpoints
  getJobs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/jobs?${queryString}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Backend unavailable, using fallback data:', error.message);
      return {
        success: true,
        data: filterData(fallbackJobs, params),
        isOffline: true
      };
    }
  },

  getJobById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Backend unavailable, using fallback data:', error.message);
      const job = fallbackJobs.find(j => j.id === parseInt(id));
      return job
        ? { success: true, data: job, isOffline: true }
        : { success: false, error: 'Job not found', isOffline: true };
    }
  },

  createJob: async () => {
    return {
      success: false,
      error: 'Database is read-only. Cannot create jobs.',
      message: 'Contact administrator to add jobs'
    };
  },

  // Candidates endpoints
  getCandidates: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/candidates?${queryString}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Backend unavailable, using fallback data:', error.message);
      return {
        success: true,
        data: filterData(fallbackCandidates, params),
        isOffline: true
      };
    }
  },

  getCandidateById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/candidates/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Backend unavailable, using fallback data:', error.message);
      const candidate = fallbackCandidates.find(c => c.id === parseInt(id));
      return candidate
        ? { success: true, data: candidate, isOffline: true }
        : { success: false, error: 'Candidate not found', isOffline: true };
    }
  },

  createCandidate: async () => {
    return {
      success: false,
      error: 'Database is read-only. Cannot create candidates.',
      message: 'Contact administrator to add candidates'
    };
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      return {
        status: 'Backend unavailable',
        isOffline: true
      };
    }
  },
};

export default api;
