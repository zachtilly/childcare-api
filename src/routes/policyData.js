const express = require('express');
const router = express.Router();
const {
  getCurrentPoliciesByState,
  getMetricComparison,
  getPolicyTimeline,
  getCurrentPolicyValue,
  getCurrentPoliciesByCategory,
  getStateComparison
} = require('../controllers/policyDataController');

// Get current policies for a state
router.get('/state/:stateCode', getCurrentPoliciesByState);

// Get comparison of a metric across all states
router.get('/metric/:metricSlug/comparison', getMetricComparison);

// Get policy timeline for a state and metric
router.get('/state/:stateCode/metric/:metricSlug/timeline', getPolicyTimeline);

// Get current value for a specific state and metric
router.get('/state/:stateCode/metric/:metricSlug', getCurrentPolicyValue);

// Get current policies by category
router.get('/category/:categorySlug', getCurrentPoliciesByCategory);

// Compare multiple states
router.get('/compare', getStateComparison);

module.exports = router;
