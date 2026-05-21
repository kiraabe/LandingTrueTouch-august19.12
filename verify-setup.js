#!/usr/bin/env node
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('\n═══════════════════════════════════════');
console.log('  SETUP VERIFICATION');
console.log('═══════════════════════════════════════\n');

const checks = [];

// Check 1: .env file
try {
  const envExists = existsSync('.env');
  checks.push({
    name: 'Environment file (.env)',
    status: envExists ? '✓' : '✗',
    details: envExists ? 'Found' : 'Missing - create it with DATABASE_URL'
  });
} catch (e) {
  checks.push({ name: 'Environment file', status: '✗', details: e.message });
}

// Check 2: index.html
try {
  const htmlExists = existsSync('index.html');
  checks.push({
    name: 'React entry point (index.html)',
    status: htmlExists ? '✓' : '✗',
    details: htmlExists ? 'Found' : 'Missing'
  });
} catch (e) {
  checks.push({ name: 'index.html', status: '✗', details: e.message });
}

// Check 3: package.json
try {
  const packageExists = existsSync('package.json');
  if (packageExists) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const hasExpress = !!pkg.dependencies.express;
    const hasPg = !!pkg.dependencies.pg;
    const hasVite = !!pkg.dependencies.vite;
    
    checks.push({
      name: 'Dependencies (express, pg, vite)',
      status: (hasExpress && hasPg && hasVite) ? '✓' : '✗',
      details: `express: ${hasExpress ? '✓' : '✗'}, pg: ${hasPg ? '✓' : '✗'}, vite: ${hasVite ? '✓' : '✗'}`
    });
  }
} catch (e) {
  checks.push({ name: 'package.json', status: '✗', details: e.message });
}

// Check 4: Backend files
const backendFiles = [
  'server.js',
  'server/config/database.js',
  'server/routes/index.js',
  'server/middleware/error-handler.js'
];

backendFiles.forEach(file => {
  const exists = existsSync(file);
  if (checks.length < 10) {
    checks.push({
      name: `Backend file: ${file}`,
      status: exists ? '✓' : '✗',
      details: exists ? 'Found' : 'Missing'
    });
  }
});

// Display results
checks.forEach((check, i) => {
  console.log(`${i + 1}. ${check.name}`);
  console.log(`   Status: ${check.status}`);
  console.log(`   Details: ${check.details}\n`);
});

// Summary
const passed = checks.filter(c => c.status === '✓').length;
const total = checks.length;

console.log('═══════════════════════════════════════');
console.log(`  Result: ${passed}/${total} checks passed`);
console.log('═══════════════════════════════════════\n');

if (passed === total) {
  console.log('✓ Setup is ready! Run: npm start\n');
  process.exit(0);
} else {
  console.log('✗ Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
