#!/usr/bin/env node

console.log('[Debug] Starting debug server...\n');

import('express').then(() => {
  console.log('[✓] express loaded');
}).catch(e => console.error('[✗] express:', e.message));

import('cors').then(() => {
  console.log('[✓] cors loaded');
}).catch(e => console.error('[✗] cors:', e.message));

import('pg').then(() => {
  console.log('[✓] pg loaded');
}).catch(e => console.error('[✗] pg:', e.message));

import('dotenv').then(() => {
  console.log('[✓] dotenv loaded');
}).catch(e => console.error('[✗] dotenv:', e.message));

import('vite').then(() => {
  console.log('[✓] vite loaded');
}).catch(e => console.error('[✗] vite:', e.message));

import('@vitejs/plugin-react').then(() => {
  console.log('[✓] @vitejs/plugin-react loaded');
}).catch(e => console.error('[✗] @vitejs/plugin-react:', e.message));

console.log('[Debug] Attempting to import server modules...\n');

import('./server/config/database.js').then(() => {
  console.log('[✓] server/config/database.js loaded');
}).catch(e => console.error('[✗] database.js:', e.message));

import('./server/middleware/error-handler.js').then(() => {
  console.log('[✓] server/middleware/error-handler.js loaded');
}).catch(e => console.error('[✗] error-handler.js:', e.message));

import('./server/routes/index.js').then(() => {
  console.log('[✓] server/routes/index.js loaded');
}).catch(e => console.error('[✗] routes/index.js:', e.message));

import('./server/vite-dev-server.js').then(() => {
  console.log('[✓] server/vite-dev-server.js loaded');
}).catch(e => console.error('[✗] vite-dev-server.js:', e.message));

setTimeout(() => {
  console.log('\n[Debug] All modules loaded successfully!');
  process.exit(0);
}, 2000);

setTimeout(() => {
  console.error('\n[Debug] Module loading took too long, exiting...');
  process.exit(1);
}, 5000);
