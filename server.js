import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import createViteServer from './server/vite-dev-server.js';
import apiRoutes from './server/routes/index.js';
import errorHandler from './server/middleware/error-handler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded media)
app.use('/uploads', express.static(join(__dirname, 'public/uploads')));
app.use('/assets', express.static(join(__dirname, 'public')));

// API routes (before Vite so they're not intercepted)
app.use('/api', apiRoutes);

let vite;

async function startServer() {
  // Setup Vite for development or production build serving
  if (isDev) {
    try {
      vite = await createViteServer(app);
      console.log('[✓] Vite dev server initialized');
    } catch (error) {
      console.warn('[⚠] Vite initialization failed, serving static assets instead:', error.message);
      // Fallback: serve index.html directly
      app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'));
      });
      app.use(express.static(join(__dirname, 'public')));
    }
  } else {
    // Serve production build
    try {
      app.use(express.static(join(__dirname, 'build')));
      console.log('[✓] Production build serving configured');
    } catch (error) {
      console.warn('[⚠] Build directory not found, serving public folder:', error.message);
      app.use(express.static(join(__dirname, 'public')));
    }
  }

  // Global error handler (must be last)
  app.use(errorHandler);

  // Start listening
  const server = app.listen(PORT, () => {
    console.log(`\n✓ Server is running!`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  API: http://localhost:${PORT}/api`);
    console.log(`  Mode: ${isDev ? 'development (with HMR)' : 'production'}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[✗] Port ${PORT} is already in use`);
    } else {
      console.error('[✗] Server error:', err.message);
    }
    process.exit(1);
  });
}

// Start the server immediately
console.log('[Starting] Initializing server...\n');

startServer()
  .then(() => {
    // Server is running
  })
  .catch((err) => {
    console.error('[✗] Fatal error:', err.message);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  });
