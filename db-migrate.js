const pool = require('./db');

async function migrate() {
  try {
    console.log('🔧 Running database migrations...');

    // Create contact_us table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_us (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ contact_us table created or already exists');

    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

module.exports = migrate;
