const http = require('http');

const testId = '161a17ba-845a-4fa9-aeef-e248bf95edb6';

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: `/api/blogs/${testId}`,
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  process.exit(1);
});

req.end();
