// Simple API Key Authentication for Admin Endpoints
// IMPORTANT: Enable this before deploying to production!

const AUTH_API_KEY = process.env.ADMIN_API_KEY;

function requireAuth(req, res, next) {
  // Skip auth in development if no key is set
  if (process.env.NODE_ENV !== 'production' && !AUTH_API_KEY) {
    console.warn('⚠️  WARNING: Admin authentication is disabled! Set ADMIN_API_KEY in production.');
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Missing API key. Include X-API-Key header.'
    });
  }

  if (apiKey !== AUTH_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
}

module.exports = { requireAuth };
