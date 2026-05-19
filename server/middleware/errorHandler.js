export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.code === 'QUERY_ERROR' || err.message.includes('database')) {
    return res.status(500).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
  }

  if (err.status === 404) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
