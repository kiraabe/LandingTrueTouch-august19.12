const pool = require('./db');

(async () => {
  try {
    // Check if jobs table exists
    const tableCheck = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'jobs'");
    console.log('Jobs table exists:', tableCheck.rows.length > 0);
    
    // Check jobs count
    const countResult = await pool.query('SELECT COUNT(*) FROM jobs');
    console.log('Jobs count:', countResult.rows[0].count);
    
    // Get sample jobs
    const result = await pool.query('SELECT id, title, description FROM jobs LIMIT 3');
    console.log('Sample jobs:', result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
