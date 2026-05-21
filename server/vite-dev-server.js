import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function createViteDevServer(app) {
  try {
    const vite = await createViteServer({
      plugins: [react()],
      server: {
        middlewareMode: true,
        fs: {
          strict: false,
          allow: [join(__dirname, '..')],
        },
      },
      appType: 'mpa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // SPA fallback - transform index.html for client-side routing
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
      }

      try {
        const url = req.originalUrl.startsWith('/') ? req.originalUrl : '/' + req.originalUrl;
        let html = readFileSync(join(__dirname, '../index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, html);
        return res.type('html').end(html);
      } catch (error) {
        console.error('[Vite] Error transforming HTML:', error.message);
        return next(error);
      }
    });

    return vite;
  } catch (error) {
    console.error('[Vite] Failed to create dev server:', error.message);
    throw error;
  }
}
