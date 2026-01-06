require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const statesRoutes = require('./routes/states');
const policyRoutes = require('./routes/policy');
const policyDataRoutes = require('./routes/policyData');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Child Care Policy API',
    version: '1.0.0',
    endpoints: {
      states: '/api/states',
      policy: '/api/policy',
      policyData: '/api/data',
      admin: '/api/admin'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/states', statesRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/data', policyDataRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Child Care Policy API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   GET  /                                    - API info`);
  console.log(`   GET  /health                              - Health check`);
  console.log(`   GET  /api/states                          - All states`);
  console.log(`   GET  /api/states/code/:code               - State by code`);
  console.log(`   GET  /api/states/code/:code/context       - State with context`);
  console.log(`   GET  /api/policy/categories               - All categories`);
  console.log(`   GET  /api/policy/categories/:slug         - Category details`);
  console.log(`   GET  /api/policy/metrics                  - All metrics`);
  console.log(`   GET  /api/policy/metrics/:slug            - Metric details`);
  console.log(`   GET  /api/data/state/:stateCode           - Current policies by state`);
  console.log(`   GET  /api/data/metric/:slug/comparison    - Compare metric across states`);
  console.log(`   GET  /api/data/state/:code/metric/:slug   - Specific policy value`);
  console.log(`   GET  /api/data/compare?stateCodes=CA,TX   - Compare multiple states`);
  console.log(`\n   📝 Admin endpoints:`);
  console.log(`   POST   /api/admin/policy-data             - Create policy data`);
  console.log(`   PUT    /api/admin/policy-data/:id         - Update policy data`);
  console.log(`   DELETE /api/admin/policy-data/:id         - Delete policy data`);
  console.log(`   POST   /api/admin/policy-data/bulk        - Bulk import policy data`);
  console.log(`   POST   /api/admin/metrics                 - Create metric`);
  console.log(`   PUT    /api/admin/metrics/:identifier     - Update metric`);
  console.log(`   DELETE /api/admin/metrics/:identifier     - Delete metric`);
  console.log(`   POST   /api/admin/categories              - Create category`);
  console.log(`   PUT    /api/admin/categories/:identifier  - Update category`);
  console.log(`   DELETE /api/admin/categories/:identifier  - Delete category`);
  console.log(`   POST   /api/admin/state-context           - Create/update state context`);
  console.log(`   GET    /api/admin/state-context/:code/history - Get state context history`);
  console.log(`   DELETE /api/admin/state-context/:id       - Delete state context`);
  console.log(`\n✅ Server ready!\n`);
});

module.exports = app;
