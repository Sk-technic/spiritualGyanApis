module.exports = (req, res, next) => {
  // simple, non-revealing response for unknown routes
  res.status(404).json({ success: false, message: 'Not found' });
};
