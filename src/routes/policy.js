const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
  getAllMetrics,
  getMetricBySlug
} = require('../controllers/policyController');

// Category routes
router.get('/categories', getAllCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Metric routes
router.get('/metrics', getAllMetrics);
router.get('/metrics/:slug', getMetricBySlug);

module.exports = router;
