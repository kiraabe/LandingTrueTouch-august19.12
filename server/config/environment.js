const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  API_PREFIX: '/api',
  
  pagination: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },

  cache: {
    TTL_SECONDS: 300,
  },
};

export default environment;
