const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());

// Serve static files from the React build folder
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// API routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const candidatesRouter = require('./routes/candidates');
app.use('/api', candidatesRouter);

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application');
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api/candidates/featured`);
  console.log(`✓ Health: http://localhost:${PORT}/health\n`);
});
