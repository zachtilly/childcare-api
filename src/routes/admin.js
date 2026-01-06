const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {
  validatePolicyData,
  validateMetric,
  validateCategory,
  validateStateContext
} = require('../middleware/validation');

// ============================================
// POLICY DATA ROUTES
// ============================================

// Create new policy data entry
router.post('/policy-data', validatePolicyData, adminController.createPolicyData);

// Update policy data entry
router.put('/policy-data/:id', validatePolicyData, adminController.updatePolicyData);

// Delete policy data entry
router.delete('/policy-data/:id', adminController.deletePolicyData);

// Bulk import policy data
router.post('/policy-data/bulk', adminController.bulkImportPolicyData);

// ============================================
// METRICS ROUTES
// ============================================

// Create new metric
router.post('/metrics', validateMetric, adminController.createMetric);

// Update metric (by ID or slug)
router.put('/metrics/:identifier', validateMetric, adminController.updateMetric);

// Delete metric (by ID or slug)
router.delete('/metrics/:identifier', adminController.deleteMetric);

// ============================================
// CATEGORIES ROUTES
// ============================================

// Create new category
router.post('/categories', validateCategory, adminController.createCategory);

// Update category (by ID or slug)
router.put('/categories/:identifier', validateCategory, adminController.updateCategory);

// Delete category (by ID or slug)
router.delete('/categories/:identifier', adminController.deleteCategory);

// ============================================
// STATE CONTEXT ROUTES
// ============================================

// Create or update state context
router.post('/state-context', validateStateContext, adminController.upsertStateContext);

// Get state context history
router.get('/state-context/:stateCode/history', adminController.getStateContextHistory);

// Delete state context entry
router.delete('/state-context/:id', adminController.deleteStateContext);

module.exports = router;
