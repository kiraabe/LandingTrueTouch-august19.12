const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function startServer() {
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
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Development: use Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true }
    });

    app.use(vite.middlewares);

    // Add 404 handler for SPA
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        vite.transformIndexHtml(req.url, fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'))
          .then(html => res.send(html))
          .catch(err => {
            res.status(500).send('Error loading application');
          });
      } else {
        next();
      }
    });
  } else {
    // Production: serve static files from build folder
    const buildPath = path.join(__dirname, 'build');
    if (fs.existsSync(buildPath)) {
      app.use(express.static(buildPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
      });
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Frontend: http://localhost:${PORT}`);
    console.log(`✓ API: http://localhost:${PORT}/api/candidates/featured`);
    console.log(`✓ Health: http://localhost:${PORT}/health\n`);
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
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
