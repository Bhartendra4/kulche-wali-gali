'use strict';
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err && err.stack ? err.stack : err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong. Please try again later.' : err.message
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

module.exports = { errorHandler, notFound };
