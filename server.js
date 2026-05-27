const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Image proxy endpoint for external URLs
app.get('/proxy', async (req, res) => {
  try {
    const externalUrl = req.query.url;

    if (!externalUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Validate it's a valid URL
    try {
      new URL(externalUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Use http or https based on the URL
    const protocol = externalUrl.startsWith('https') ? https : http;

    protocol.get(externalUrl, { timeout: 10000 }, (response) => {
      // Check for HTTP errors
      if (response.statusCode >= 400) {
        return res.status(response.statusCode).json({ error: 'Failed to fetch image' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

      // Pipe the response
      response.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy error:', err);
      res.status(502).json({ error: 'Failed to fetch image' });
    });
  } catch (error) {
    console.error('Proxy handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

try {
  const blogsRouter = require('./routes/blogs');
  app.use('/api', blogsRouter);
} catch (error) {
  console.error('Error loading blogs router:', error);
}

try {
  const jobsRouter = require('./routes/jobs');
  app.use('/api', jobsRouter);
} catch (error) {
  console.error('Error loading jobs router:', error);
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
