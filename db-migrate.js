const pool = require('./db');

async function migrate() {
  try {
    console.log('🔧 Running database migrations...');

    // Wait a moment for database connection to establish
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create contact_us table
    const createTableQuery = `
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
    `;

    await pool.query(createTableQuery);
    console.log('✓ contact_us table created or already exists');

    // Verify table was created
    const checkTable = await pool.query(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'contact_us')"
    );
    console.log('✓ Table verification:', checkTable.rows[0].exists ? 'SUCCESS' : 'FAILED');

    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

module.exports = migrate;
