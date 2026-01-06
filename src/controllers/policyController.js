const supabase = require('../config/database');

// Get all policy categories
const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('policy_categories')
      .select('*')
      .order('sort_order');

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

// Get category by slug with its metrics
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: category, error: categoryError } = await supabase
      .from('policy_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) throw categoryError;

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get metrics for this category
    const { data: metrics, error: metricsError } = await supabase
      .from('policy_metrics')
      .select('*')
      .eq('category_id', category.id)
      .order('sort_order');

    if (metricsError) throw metricsError;

    res.json({
      success: true,
      data: {
        ...category,
        metrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all metrics
const getAllMetrics = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('policy_metrics')
      .select(`
        *,
        policy_categories(name, slug)
      `)
      .order('category_id')
      .order('sort_order');

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

// Get metric by slug
const getMetricBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('policy_metrics')
      .select(`
        *,
        policy_categories(name, slug, description)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found'
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

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getAllMetrics,
  getMetricBySlug
};
