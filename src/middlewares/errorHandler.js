module.exports = (err, req, res, next) => {
  console.error('Error:', err && err.stack ? err.stack : err);

  // don't leak internal details in production
  const isProd = process.env.NODE_ENV === 'production';

  const message = isProd ? 'Internal server error' : (err.message || 'Internal server error');
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message
  });
};
