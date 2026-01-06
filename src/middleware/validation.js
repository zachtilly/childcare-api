const { supabase } = require('../config/database');

// Helper: Validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Helper: Validate JSONB value based on data type
function validateValueByDataType(value, dataType, allowedValues = null) {
  const errors = [];

  if (!value || typeof value !== 'object') {
    errors.push('Value must be a valid object');
    return errors;
  }

  switch (dataType) {
    case 'numeric':
    case 'percentage':
      if (typeof value.numeric !== 'number') {
        errors.push(`Value must contain a numeric field with a number`);
      }
      if (dataType === 'percentage' && (value.numeric < 0 || value.numeric > 100)) {
        errors.push('Percentage must be between 0 and 100');
      }
      break;

    case 'currency':
      if (typeof value.currency !== 'number' || value.currency < 0) {
        errors.push('Value must contain a currency field with a non-negative number');
      }
      break;

    case 'boolean':
      if (typeof value.boolean !== 'boolean') {
        errors.push('Value must contain a boolean field');
      }
      break;

    case 'text':
      if (typeof value.text !== 'string') {
        errors.push('Value must contain a text field with a string');
      }
      break;

    case 'enum':
      if (typeof value.text !== 'string') {
        errors.push('Value must contain a text field with a string for enum type');
      } else if (allowedValues && !allowedValues.includes(value.text)) {
        errors.push(`Value must be one of: ${allowedValues.join(', ')}`);
      }
      break;

    default:
      errors.push(`Unknown data type: ${dataType}`);
  }

  return errors;
}

// Helper: Format value object from input based on data type
function formatValueByDataType(inputValue, dataType) {
  switch (dataType) {
    case 'numeric':
    case 'percentage':
      return { numeric: parseFloat(inputValue) };
    case 'currency':
      return { currency: parseInt(inputValue) };
    case 'boolean':
      return { boolean: inputValue === true || inputValue === 'true' || inputValue === '1' || inputValue === 1 };
    case 'text':
    case 'enum':
      return { text: String(inputValue) };
    default:
      return inputValue;
  }
}

// Middleware: Validate policy data
async function validatePolicyData(req, res, next) {
  const { state_id, metric_id, value, effective_date, end_date, data_source, confidence_level } = req.body;
  const errors = [];

  // Required fields
  if (!state_id) errors.push('state_id is required');
  if (!metric_id) errors.push('metric_id is required');
  if (!value) errors.push('value is required');
  if (!effective_date) errors.push('effective_date is required');
  if (!data_source) errors.push('data_source is required');
  if (!confidence_level) errors.push('confidence_level is required');

  // Validate confidence level
  if (confidence_level && !['high', 'medium', 'low'].includes(confidence_level)) {
    errors.push('confidence_level must be one of: high, medium, low');
  }

  // Validate dates
  if (effective_date && !isValidDate(effective_date)) {
    errors.push('effective_date must be in YYYY-MM-DD format');
  }
  if (end_date && !isValidDate(end_date)) {
    errors.push('end_date must be in YYYY-MM-DD format');
  }
  if (effective_date && end_date && new Date(effective_date) >= new Date(end_date)) {
    errors.push('effective_date must be before end_date');
  }

  // Validate state exists
  if (state_id) {
    const { data: state, error } = await supabase
      .from('states')
      .select('id')
      .eq('id', state_id)
      .single();

    if (error || !state) {
      errors.push('Invalid state_id');
    }
  }

  // Validate metric exists and get data type
  if (metric_id) {
    const { data: metric, error } = await supabase
      .from('policy_metrics')
      .select('id, data_type, allowed_values')
      .eq('id', metric_id)
      .single();

    if (error || !metric) {
      errors.push('Invalid metric_id');
    } else if (value) {
      // Validate value matches metric data type
      const valueErrors = validateValueByDataType(value, metric.data_type, metric.allowed_values);
      errors.push(...valueErrors);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

// Middleware: Validate metric
async function validateMetric(req, res, next) {
  const { name, slug, category_id, data_type, description } = req.body;
  const errors = [];

  // Required fields
  if (!name) errors.push('name is required');
  if (!slug) errors.push('slug is required');
  if (!category_id) errors.push('category_id is required');
  if (!data_type) errors.push('data_type is required');
  if (!description) errors.push('description is required');

  // Validate data type
  const validDataTypes = ['numeric', 'currency', 'percentage', 'boolean', 'text', 'enum'];
  if (data_type && !validDataTypes.includes(data_type)) {
    errors.push(`data_type must be one of: ${validDataTypes.join(', ')}`);
  }

  // Validate slug format (lowercase, hyphens only)
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('slug must be lowercase alphanumeric with hyphens only');
  }

  // Check slug uniqueness (skip for updates of same slug)
  if (slug) {
    const identifier = req.params.identifier;
    let query = supabase.from('policy_metrics').select('id, slug').eq('slug', slug);

    // If updating, exclude current metric
    if (identifier) {
      const { data: current } = await supabase
        .from('policy_metrics')
        .select('id, slug')
        .or(`id.eq.${identifier},slug.eq.${identifier}`)
        .single();

      if (current && current.slug !== slug) {
        const { data: existing } = await query.single();
        if (existing) {
          errors.push('slug must be unique');
        }
      }
    } else {
      const { data: existing } = await query.single();
      if (existing) {
        errors.push('slug must be unique');
      }
    }
  }

  // Validate category exists
  if (category_id) {
    const { data: category, error } = await supabase
      .from('policy_categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (error || !category) {
      errors.push('Invalid category_id');
    }
  }

  // Validate allowed_values required for enum type
  if (data_type === 'enum' && (!req.body.allowed_values || !Array.isArray(req.body.allowed_values) || req.body.allowed_values.length === 0)) {
    errors.push('allowed_values is required and must be a non-empty array for enum data type');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

// Middleware: Validate category
async function validateCategory(req, res, next) {
  const { name, slug, description } = req.body;
  const errors = [];

  // Required fields
  if (!name) errors.push('name is required');
  if (!slug) errors.push('slug is required');
  if (!description) errors.push('description is required');

  // Validate slug format
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('slug must be lowercase alphanumeric with hyphens only');
  }

  // Check slug uniqueness
  if (slug) {
    const identifier = req.params.identifier;
    let query = supabase.from('policy_categories').select('id, slug').eq('slug', slug);

    if (identifier) {
      const { data: current } = await supabase
        .from('policy_categories')
        .select('id, slug')
        .or(`id.eq.${identifier},slug.eq.${identifier}`)
        .single();

      if (current && current.slug !== slug) {
        const { data: existing } = await query.single();
        if (existing) {
          errors.push('slug must be unique');
        }
      }
    } else {
      const { data: existing } = await query.single();
      if (existing) {
        errors.push('slug must be unique');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

// Middleware: Validate state code
async function validateStateCode(req, res, next) {
  const { state_code } = req.body || req.params;

  if (!state_code) {
    return res.status(400).json({
      success: false,
      error: 'state_code is required'
    });
  }

  // Validate format (2-letter uppercase)
  if (!/^[A-Z]{2}$/.test(state_code)) {
    return res.status(400).json({
      success: false,
      error: 'state_code must be 2-letter uppercase state code'
    });
  }

  // Validate state exists
  const { data: state, error } = await supabase
    .from('states')
    .select('id')
    .eq('code', state_code)
    .single();

  if (error || !state) {
    return res.status(400).json({
      success: false,
      error: 'Invalid state_code'
    });
  }

  // Attach state_id to request for convenience
  req.state_id = state.id;
  next();
}

// Middleware: Validate state context
async function validateStateContext(req, res, next) {
  const {
    state_id,
    as_of_date,
    total_licensed_capacity,
    total_workers
  } = req.body;

  const errors = [];

  // Required fields
  if (!state_id) errors.push('state_id is required');
  if (!as_of_date) errors.push('as_of_date is required');

  // Validate date
  if (as_of_date && !isValidDate(as_of_date)) {
    errors.push('as_of_date must be in YYYY-MM-DD format');
  }

  // Validate state exists
  if (state_id) {
    const { data: state, error } = await supabase
      .from('states')
      .select('id')
      .eq('id', state_id)
      .single();

    if (error || !state) {
      errors.push('Invalid state_id');
    }
  }

  // Validate numeric fields are non-negative
  const numericFields = [
    'total_licensed_capacity', 'infant_capacity', 'toddler_capacity',
    'preschool_capacity', 'school_age_capacity',
    'infant_cost_weekly', 'toddler_cost_weekly', 'preschool_cost_weekly', 'school_age_cost_weekly',
    'total_workers', 'lead_teachers', 'assistant_teachers', 'aides'
  ];

  numericFields.forEach(field => {
    const value = req.body[field];
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        errors.push(`${field} must be a non-negative number`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = {
  validatePolicyData,
  validateMetric,
  validateCategory,
  validateStateCode,
  validateStateContext,
  validateValueByDataType,
  formatValueByDataType,
  isValidDate
};
