import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { ViteDevServer } from 'vite';
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

// API routes
app.use('/api', apiRoutes);

let vite;

async function startServer() {
  if (isDev) {
    try {
      vite = await createViteServer(app);
      console.log('Vite dev server initialized');
    } catch (error) {
      console.error('Failed to initialize Vite dev server:', error.message);
      process.exit(1);
    }
  } else {
    // Serve production build
    app.use(express.static(join(__dirname, 'build')));
  }

  // Error handler (must be last)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ Environment: ${isDev ? 'development' : 'production'}`);
    console.log(`✓ API: http://localhost:${PORT}/api`);
    if (isDev) {
      console.log(`✓ Frontend: http://localhost:${PORT}`);
    }
    console.log('\n');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
