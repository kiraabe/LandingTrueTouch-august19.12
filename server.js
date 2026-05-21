const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// API routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

try {
  const candidatesRouter = require('./routes/candidates');
  app.use('/api', candidatesRouter);
} catch (error) {
  console.error('Error loading candidates router:', error);
}

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✓ Backend API running on http://localhost:${PORT}`);
  console.log(`✓ Health: http://localhost:${PORT}/health`);
  console.log(`✓ Candidates: http://localhost:${PORT}/api/candidates/featured\n`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
