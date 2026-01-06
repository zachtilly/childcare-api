const supabase = require('../config/database');

// Get current policy values for a state
const getCurrentPoliciesByState = async (req, res) => {
  try {
    const { stateCode } = req.params;

    const { data, error } = await supabase
      .from('current_policy_values')
      .select('*')
      .eq('state_code', stateCode.toUpperCase());

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

// Get current policy value for a specific metric across all states
const getMetricComparison = async (req, res) => {
  try {
    const { metricSlug } = req.params;

    const { data, error } = await supabase
      .from('current_policy_values')
      .select('*')
      .eq('metric_slug', metricSlug)
      .order('state_name');

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

// Get policy timeline for a state and metric
const getPolicyTimeline = async (req, res) => {
  try {
    const { stateCode, metricSlug } = req.params;

    // Get state ID
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode.toUpperCase())
      .single();

    if (stateError) throw stateError;

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    // Get metric ID
    const { data: metric, error: metricError } = await supabase
      .from('policy_metrics')
      .select('id, name, data_type, unit')
      .eq('slug', metricSlug)
      .single();

    if (metricError) throw metricError;

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found'
      });
    }

    // Get policy data timeline
    const { data: timeline, error: timelineError } = await supabase
      .from('policy_data')
      .select('*')
      .eq('state_id', state.id)
      .eq('metric_id', metric.id)
      .order('effective_date', { ascending: true });

    if (timelineError) throw timelineError;

    res.json({
      success: true,
      data: {
        metric,
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get current value for a specific state and metric
const getCurrentPolicyValue = async (req, res) => {
  try {
    const { stateCode, metricSlug } = req.params;

    const { data, error } = await supabase
      .from('current_policy_values')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .eq('metric_slug', metricSlug)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Policy data not found'
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

// Get all current policies by category
const getCurrentPoliciesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    // Get category
    const { data: category, error: categoryError } = await supabase
      .from('policy_categories')
      .select('id, name, slug')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) throw categoryError;

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get all current policy values for this category
    const { data, error } = await supabase
      .from('current_policy_values')
      .select('*')
      .eq('category', category.name)
      .order('state_name')
      .order('metric_name');

    if (error) throw error;

    res.json({
      success: true,
      data: {
        category,
        policies: data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get state comparison with multiple metrics
const getStateComparison = async (req, res) => {
  try {
    const { stateCodes } = req.query; // Comma-separated state codes
    const { metricSlugs } = req.query; // Comma-separated metric slugs (optional)

    if (!stateCodes) {
      return res.status(400).json({
        success: false,
        error: 'stateCodes query parameter is required'
      });
    }

    const codeArray = stateCodes.split(',').map(c => c.trim().toUpperCase());

    let query = supabase
      .from('current_policy_values')
      .select('*')
      .in('state_code', codeArray);

    if (metricSlugs) {
      const slugArray = metricSlugs.split(',').map(s => s.trim());
      query = query.in('metric_slug', slugArray);
    }

    const { data, error } = await query
      .order('state_code')
      .order('category')
      .order('metric_name');

    if (error) throw error;

    // Group by state
    const grouped = codeArray.reduce((acc, code) => {
      acc[code] = data.filter(d => d.state_code === code);
      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getCurrentPoliciesByState,
  getMetricComparison,
  getPolicyTimeline,
  getCurrentPolicyValue,
  getCurrentPoliciesByCategory,
  getStateComparison
};
