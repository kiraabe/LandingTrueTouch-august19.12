const pool = require('./db');

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');

    // Drop blogs table if it exists
    await pool.query('DROP TABLE IF EXISTS blogs');
    console.log('✓ Blogs table removed');

    // Create jobs table with the exact schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(56) NOT NULL,
        description VARCHAR(78) NOT NULL,
        author VARCHAR(15) DEFAULT 'admin',
        image_url VARCHAR(255),
        expire_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Jobs table created or already exists');

    // Insert sample data if table is empty
    const jobsCount = await pool.query('SELECT COUNT(*) FROM jobs');
    if (jobsCount.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO jobs (title, description, author, image_url, expire_date, status)
        VALUES
          ('Senior Developer', 'We are looking for a Senior Developer', 'John Doe', 'https://via.placeholder.com/300', CURRENT_DATE + INTERVAL '30 days', 'active'),
          ('Frontend Engineer', 'Build amazing user interfaces', 'Jane Smith', 'https://via.placeholder.com/300', CURRENT_DATE + INTERVAL '25 days', 'active'),
          ('Product Manager', 'Lead product strategy and vision', 'Mike Johnson', 'https://via.placeholder.com/300', CURRENT_DATE + INTERVAL '35 days', 'active')
      `);
      console.log('✓ Sample jobs inserted');
    }

    console.log('✅ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
