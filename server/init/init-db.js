require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split and execute queries
    const queries = schema.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        await db.query(query);
      }
    }
    
    console.log('✓ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
