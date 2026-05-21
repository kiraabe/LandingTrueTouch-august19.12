#!/usr/bin/env node
const http = require('http');

const apiUrl = process.argv[2] || 'http://localhost:3001';

console.log(`\n📡 Testing API connection to: ${apiUrl}\n`);

const testEndpoints = [
  '/health',
  '/api/candidates/featured'
];

let completed = 0;

testEndpoints.forEach(endpoint => {
  const fullUrl = `${apiUrl}${endpoint}`;
  const url = new URL(fullUrl);
  
  const protocol = url.protocol === 'https:' ? require('https') : http;
  
  console.log(`Testing ${endpoint}...`);
  
  const req = protocol.get(fullUrl, { timeout: 5000 }, (res) => {
    console.log(`✓ ${endpoint}: HTTP ${res.statusCode}`);
    completed++;
    if (completed === testEndpoints.length) showSummary();
  });
  
  req.on('error', (err) => {
    console.log(`✗ ${endpoint}: ${err.message}`);
    completed++;
    if (completed === testEndpoints.length) showSummary();
  });
  
  req.on('timeout', () => {
    console.log(`✗ ${endpoint}: Timeout (5s)`);
    req.destroy();
    completed++;
    if (completed === testEndpoints.length) showSummary();
  });
});

function showSummary() {
  console.log(`\n📋 Summary:`);
  console.log(`If all tests passed: ✓ Backend is running and accessible`);
  console.log(`If tests failed:`);
  console.log(`  1. Make sure npm run server is running`);
  console.log(`  2. If testing from cloud, ensure ngrok is running: ngrok http 3001`);
  console.log(`  3. Check .env.local has correct VITE_API_URL\n`);
}
