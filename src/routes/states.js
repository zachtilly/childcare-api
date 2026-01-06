const express = require('express');
const router = express.Router();
const {
  getAllStates,
  getStateById,
  getStateByCode,
  getStateWithContext
} = require('../controllers/statesController');

// Get all states
router.get('/', getAllStates);

// Get state by ID
router.get('/id/:id', getStateById);

// Get state by code
router.get('/code/:code', getStateByCode);

// Get state with childcare context
router.get('/code/:code/context', getStateWithContext);

module.exports = router;
