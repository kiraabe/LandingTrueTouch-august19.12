#!/usr/bin/env node

console.log('Testing imports...\n');

try {
  console.log('✓ Testing express...');
  import('express').then(() => {
    console.log('✓ express imported\n');
  });

  console.log('✓ Testing pg...');
  import('pg').then(() => {
    console.log('✓ pg imported\n');
  });

  console.log('✓ Testing vite...');
  import('vite').then(() => {
    console.log('✓ vite imported\n');
  });

  console.log('✓ Testing @vitejs/plugin-react...');
  import('@vitejs/plugin-react').then(() => {
    console.log('✓ @vitejs/plugin-react imported\n');
  });

  console.log('✓ Testing server modules...');
  import('./server/config/database.js').then(() => {
    console.log('✓ database.js imported\n');
  });

  import('./server/middleware/error-handler.js').then(() => {
    console.log('✓ error-handler.js imported\n');
  });

  import('./server/routes/index.js').then(() => {
    console.log('✓ routes/index.js imported\n');
  });

  setTimeout(() => {
    console.log('All imports successful!');
    process.exit(0);
  }, 1000);
} catch (error) {
  console.error('✗ Import failed:', error.message);
  process.exit(1);
}
