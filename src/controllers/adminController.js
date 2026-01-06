const { supabase } = require('../config/database');
const { formatValueByDataType } = require('../middleware/validation');

// ============================================
// POLICY DATA CRUD OPERATIONS
// ============================================

// Create new policy data entry
async function createPolicyData(req, res) {
  try {
    const {
      state_id,
      metric_id,
      value,
      effective_date,
      end_date,
      data_source,
      source_url,
      confidence_level,
      notes
    } = req.body;

    const insertData = {
      state_id,
      metric_id,
      value,
      effective_date,
      end_date: end_date || null,
      data_source,
      source_url: source_url || null,
      confidence_level,
      notes: notes || null,
      created_by: 'admin-ui'
    };

    const { data, error } = await supabase
      .from('policy_data')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating policy data:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createPolicyData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update existing policy data entry
async function updatePolicyData(req, res) {
  try {
    const { id } = req.params;
    const {
      state_id,
      metric_id,
      value,
      effective_date,
      end_date,
      data_source,
      source_url,
      confidence_level,
      notes
    } = req.body;

    const updateData = {};
    if (state_id !== undefined) updateData.state_id = state_id;
    if (metric_id !== undefined) updateData.metric_id = metric_id;
    if (value !== undefined) updateData.value = value;
    if (effective_date !== undefined) updateData.effective_date = effective_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (data_source !== undefined) updateData.data_source = data_source;
    if (source_url !== undefined) updateData.source_url = source_url;
    if (confidence_level !== undefined) updateData.confidence_level = confidence_level;
    if (notes !== undefined) updateData.notes = notes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('policy_data')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy data:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

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
    console.error('Error in updatePolicyData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete policy data entry
async function deletePolicyData(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('policy_data')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting policy data:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

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
    console.error('Error in deletePolicyData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Bulk import policy data
async function bulkImportPolicyData(req, res) {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'entries must be a non-empty array'
      });
    }

    // Get all states and metrics for validation and lookup
    const { data: states } = await supabase.from('states').select('id, code');
    const { data: metrics } = await supabase.from('policy_metrics').select('id, slug, data_type, allowed_values');

    const statesByCode = {};
    states.forEach(s => statesByCode[s.code] = s);

    const metricsBySlug = {};
    metrics.forEach(m => metricsBySlug[m.slug] = m);

    const results = {
      total: entries.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      try {
        // Lookup state_id from state_code
        const state = statesByCode[entry.state_code];
        if (!state) {
          throw new Error(`Invalid state code: ${entry.state_code}`);
        }

        // Lookup metric_id from metric_slug
        const metric = metricsBySlug[entry.metric_slug];
        if (!metric) {
          throw new Error(`Invalid metric slug: ${entry.metric_slug}`);
        }

        // Format value based on metric data type
        let formattedValue;
        if (typeof entry.value === 'object' && entry.value !== null) {
          formattedValue = entry.value;
        } else {
          formattedValue = formatValueByDataType(entry.value, metric.data_type);
        }

        // Check for existing entry (same state, metric, no end_date)
        const { data: existing } = await supabase
          .from('policy_data')
          .select('id')
          .eq('state_id', state.id)
          .eq('metric_id', metric.id)
          .is('end_date', null)
          .single();

        let result;
        if (existing) {
          // Update existing entry
          const { data, error } = await supabase
            .from('policy_data')
            .update({
              value: formattedValue,
              effective_date: entry.effective_date || new Date().toISOString().split('T')[0],
              data_source: entry.data_source,
              source_url: entry.source_url || null,
              confidence_level: entry.confidence_level || 'medium',
              notes: entry.notes || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // Create new entry
          const { data, error } = await supabase
            .from('policy_data')
            .insert([{
              state_id: state.id,
              metric_id: metric.id,
              value: formattedValue,
              effective_date: entry.effective_date || new Date().toISOString().split('T')[0],
              data_source: entry.data_source,
              source_url: entry.source_url || null,
              confidence_level: entry.confidence_level || 'medium',
              notes: entry.notes || null,
              created_by: 'csv-import'
            }])
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          entry,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in bulkImportPolicyData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================
// METRICS CRUD OPERATIONS
// ============================================

// Create new metric
async function createMetric(req, res) {
  try {
    const {
      name,
      slug,
      category_id,
      data_type,
      unit,
      description,
      higher_is_better,
      allowed_values,
      sort_order
    } = req.body;

    const insertData = {
      name,
      slug,
      category_id,
      data_type,
      unit: unit || null,
      description,
      higher_is_better: higher_is_better || false,
      allowed_values: allowed_values || null,
      sort_order: sort_order || 999
    };

    const { data, error } = await supabase
      .from('policy_metrics')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating metric:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createMetric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update metric
async function updateMetric(req, res) {
  try {
    const { identifier } = req.params;
    const {
      name,
      slug,
      category_id,
      data_type,
      unit,
      description,
      higher_is_better,
      allowed_values,
      sort_order
    } = req.body;

    // Find metric by ID or slug
    const { data: metric, error: findError } = await supabase
      .from('policy_metrics')
      .select('id')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (findError || !metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (data_type !== undefined) updateData.data_type = data_type;
    if (unit !== undefined) updateData.unit = unit;
    if (description !== undefined) updateData.description = description;
    if (higher_is_better !== undefined) updateData.higher_is_better = higher_is_better;
    if (allowed_values !== undefined) updateData.allowed_values = allowed_values;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('policy_metrics')
      .update(updateData)
      .eq('id', metric.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating metric:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in updateMetric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete metric
async function deleteMetric(req, res) {
  try {
    const { identifier } = req.params;

    // Find metric by ID or slug
    const { data: metric, error: findError } = await supabase
      .from('policy_metrics')
      .select('id, slug')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (findError || !metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found'
      });
    }

    // Check if metric is used in policy_data
    const { count } = await supabase
      .from('policy_data')
      .select('id', { count: 'exact', head: true })
      .eq('metric_id', metric.id);

    if (count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete metric. It is used in ${count} policy data entries.`,
        count
      });
    }

    const { data, error } = await supabase
      .from('policy_metrics')
      .delete()
      .eq('id', metric.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting metric:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in deleteMetric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================
// CATEGORIES CRUD OPERATIONS
// ============================================

// Create new category
async function createCategory(req, res) {
  try {
    const { name, slug, description, sort_order } = req.body;

    const insertData = {
      name,
      slug,
      description,
      sort_order: sort_order || 999
    };

    const { data, error } = await supabase
      .from('policy_categories')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update category
async function updateCategory(req, res) {
  try {
    const { identifier } = req.params;
    const { name, slug, description, sort_order } = req.body;

    // Find category by ID or slug
    const { data: category, error: findError } = await supabase
      .from('policy_categories')
      .select('id')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (findError || !category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('policy_categories')
      .update(updateData)
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    const { identifier } = req.params;

    // Find category by ID or slug
    const { data: category, error: findError } = await supabase
      .from('policy_categories')
      .select('id, slug')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (findError || !category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has metrics
    const { data: metrics } = await supabase
      .from('policy_metrics')
      .select('id, name')
      .eq('category_id', category.id);

    if (metrics && metrics.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${metrics.length} metrics.`,
        metrics: metrics.map(m => m.name)
      });
    }

    const { data, error } = await supabase
      .from('policy_categories')
      .delete()
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================
// STATE CONTEXT CRUD OPERATIONS
// ============================================

// Create or update state context (upsert)
async function upsertStateContext(req, res) {
  try {
    const {
      state_id,
      as_of_date,
      total_licensed_capacity,
      infant_capacity,
      toddler_capacity,
      preschool_capacity,
      school_age_capacity,
      infant_cost_weekly,
      toddler_cost_weekly,
      preschool_cost_weekly,
      school_age_cost_weekly,
      total_workers,
      lead_teachers,
      assistant_teachers,
      aides
    } = req.body;

    // Check if entry exists for this state and date
    const { data: existing } = await supabase
      .from('state_childcare_context')
      .select('state_id')
      .eq('state_id', state_id)
      .eq('as_of_date', as_of_date)
      .single();

    const contextData = {
      state_id,
      as_of_date,
      total_licensed_capacity: total_licensed_capacity || null,
      infant_capacity: infant_capacity || null,
      toddler_capacity: toddler_capacity || null,
      preschool_capacity: preschool_capacity || null,
      school_age_capacity: school_age_capacity || null,
      infant_cost_weekly: infant_cost_weekly || null,
      toddler_cost_weekly: toddler_cost_weekly || null,
      preschool_cost_weekly: preschool_cost_weekly || null,
      school_age_cost_weekly: school_age_cost_weekly || null,
      total_workers: total_workers || null,
      lead_teachers: lead_teachers || null,
      assistant_teachers: assistant_teachers || null,
      aides: aides || null
    };

    let result;
    if (existing) {
      // Update
      contextData.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('state_childcare_context')
        .update(contextData)
        .eq('state_id', state_id)
        .eq('as_of_date', as_of_date)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('state_childcare_context')
        .insert([contextData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in upsertStateContext:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get state context history
async function getStateContextHistory(req, res) {
  try {
    const { stateCode } = req.params;

    // Get state ID from code
    const { data: state } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode)
      .single();

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    const { data, error } = await supabase
      .from('state_childcare_context')
      .select('*')
      .eq('state_id', state.id)
      .order('as_of_date', { ascending: false });

    if (error) {
      console.error('Error fetching state context history:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getStateContextHistory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete state context entry
async function deleteStateContext(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('state_childcare_context')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting state context:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'State context not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in deleteStateContext:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  // Policy Data
  createPolicyData,
  updatePolicyData,
  deletePolicyData,
  bulkImportPolicyData,

  // Metrics
  createMetric,
  updateMetric,
  deleteMetric,

  // Categories
  createCategory,
  updateCategory,
  deleteCategory,

  // State Context
  upsertStateContext,
  getStateContextHistory,
  deleteStateContext
};
