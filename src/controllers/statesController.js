const supabase = require('../config/database');

// Get all states
const getAllStates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get state by ID
const getStateById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get state by code
const getStateByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get state with childcare context
const getStateWithContext = async (req, res) => {
  try {
    const { code } = req.params;

    // Get state basic info
    const { data: stateData, error: stateError } = await supabase
      .from('states')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (stateError) throw stateError;

    if (!stateData) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    // Get latest childcare context
    const { data: contextData, error: contextError } = await supabase
      .from('state_childcare_context')
      .select('*')
      .eq('state_id', stateData.id)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    res.json({
      success: true,
      data: {
        ...stateData,
        context: contextData || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllStates,
  getStateById,
  getStateByCode,
  getStateWithContext
};
