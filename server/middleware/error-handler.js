const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Database errors
  if (err.code && err.code.startsWith('POSTGRES')) {
    return res.status(400).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
  }

  // Generic error
  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
