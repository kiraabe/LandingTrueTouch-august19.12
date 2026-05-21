import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function createViteDevServer(app) {
  const vite = await createViteServer({
    plugins: [react()],
    server: {
      middlewareMode: true,
      fs: {
        strict: false,
      },
    },
  });

  app.use(vite.middlewares);

  // Transform and serve index.html
  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    try {
      let html = readFileSync(join(__dirname, '../index.html'), 'utf-8');
      html = await vite.transformIndexHtml(req.originalUrl, html);
      res.type('html').end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return vite;
}
