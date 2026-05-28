const pool = require('./db');

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');

    // Create jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        company VARCHAR(255),
        location VARCHAR(255),
        salary_range VARCHAR(100),
        job_type VARCHAR(50),
        experience_level VARCHAR(50),
        skills TEXT[],
        requirements TEXT,
        benefits TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Jobs table created or already exists');

    // Create blogs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        author VARCHAR(255),
        author_bio TEXT,
        image_url VARCHAR(500),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Blogs table created or already exists');

    // Insert sample data if tables are empty
    const jobsCount = await pool.query('SELECT COUNT(*) FROM jobs');
    if (jobsCount.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO jobs (title, description, company, location, salary_range, job_type, image_url)
        VALUES
          ('Senior Developer', 'We are looking for a Senior Developer', 'TechCorp', 'New York', '$100K-$150K', 'Full-time', 'https://via.placeholder.com/300'),
          ('Frontend Engineer', 'Build amazing user interfaces', 'StartupXYZ', 'Remote', '$80K-$120K', 'Full-time', 'https://via.placeholder.com/300'),
          ('Product Manager', 'Lead product strategy and vision', 'InnovateCo', 'San Francisco', '$120K-$160K', 'Full-time', 'https://via.placeholder.com/300')
      `);
      console.log('✓ Sample jobs inserted');
    }

    const blogsCount = await pool.query('SELECT COUNT(*) FROM blogs');
    if (blogsCount.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO blogs (title, description, content, author, author_bio, image_url)
        VALUES
          ('Getting Started with React', 'Learn the basics of React development', '<p>React is a powerful JavaScript library...</p>', 'John Doe', 'Full-stack developer with 10 years experience', 'https://via.placeholder.com/300'),
          ('Web Development Best Practices', 'Essential practices for modern web development', '<p>Following best practices is crucial...</p>', 'Jane Smith', 'Senior developer at TechCorp', 'https://via.placeholder.com/300'),
          ('The Future of Web Development', 'Trends and technologies to watch in 2024', '<p>The web development landscape is evolving...</p>', 'Mike Johnson', 'Tech blogger and consultant', 'https://via.placeholder.com/300')
      `);
      console.log('✓ Sample blogs inserted');
    }

    console.log('✅ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
