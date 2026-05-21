const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());

// API routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const candidatesRouter = require('./routes/candidates');
app.use('/api', candidatesRouter);

// Serve static files from build folder if it exists (production)
const buildPath = path.join(__dirname, 'build');
const fs = require('fs');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api/candidates/featured`);
  console.log(`✓ Health: http://localhost:${PORT}/health\n`);
});
