const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // Development: proxy frontend requests to Vite
  const httpProxy = require('http-proxy');
  const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true
  });

  // Proxy all non-API requests to Vite
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      proxy.web(req, res, (err) => {
        if (err) {
          console.error('Proxy error:', err);
          res.status(503).send('Frontend service unavailable');
        }
      });
    } else {
      next();
    }
  });

  // WebSocket support
  const server = http.createServer(app);
  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, (err) => {
      if (err) {
        console.error('WebSocket proxy error:', err);
        socket.destroy();
      }
    });
  });

  server.listen(PORT, () => {
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
} else {
  // Production mode
  const server = app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}\n`);
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
