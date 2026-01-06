require('dotenv').config();
const supabase = require('../src/config/database');

/**
 * Update a single policy value for a state
 *
 * Usage:
 * node scripts/update-policy.js CA income-eligibility-fpl 200 "CA Department of Social Services" "https://..." "high"
 */

async function updatePolicy() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node scripts/update-policy.js <state_code> <metric_slug> <value> [source] [source_url] [confidence]');
    console.log('\nExamples:');
    console.log('  node scripts/update-policy.js CA income-eligibility-fpl 200 "CA DSS" "https://..." "high"');
    console.log('  node scripts/update-policy.js TX subsidy-rate-infant 950 "TX HHS"');
    console.log('  node scripts/update-policy.js NY paid-leave-weeks 12 "NY Paid Family Leave" "" "high"');
    console.log('  node scripts/update-policy.js FL annual-inspection true "FL DCF"');
    process.exit(1);
  }

  const [stateCode, metricSlug, value, source, sourceUrl, confidence] = args;

  try {
    // Get state
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id, code, name')
      .eq('code', stateCode.toUpperCase())
      .single();

    if (stateError || !state) {
      console.error(`❌ State '${stateCode}' not found`);
      process.exit(1);
    }

    // Get metric
    const { data: metric, error: metricError } = await supabase
      .from('policy_metrics')
      .select('id, slug, name, data_type, unit')
      .eq('slug', metricSlug)
      .single();

    if (metricError || !metric) {
      console.error(`❌ Metric '${metricSlug}' not found`);
      process.exit(1);
    }

    // Format value based on data type
    let formattedValue;
    switch (metric.data_type) {
      case 'numeric':
      case 'percentage':
        formattedValue = { numeric: parseFloat(value) };
        break;
      case 'currency':
        formattedValue = { currency: parseInt(value) };
        break;
      case 'boolean':
        formattedValue = { boolean: value === 'true' || value === '1' || value === 'yes' };
        break;
      case 'text':
        formattedValue = { text: value };
        break;
      default:
        formattedValue = { text: value };
    }

    console.log(`\n📝 Updating policy data:`);
    console.log(`   State: ${state.name} (${state.code})`);
    console.log(`   Metric: ${metric.name}`);
    console.log(`   New Value: ${JSON.stringify(formattedValue)}`);
    console.log(`   Source: ${source || 'Not specified'}`);
    console.log(`   Confidence: ${confidence || 'medium'}\n`);

    // Check if policy data exists
    const { data: existing, error: checkError } = await supabase
      .from('policy_data')
      .select('id')
      .eq('state_id', state.id)
      .eq('metric_id', metric.id)
      .is('end_date', null)
      .single();

    let result;

    if (existing) {
      // Update existing
      console.log('Updating existing policy data...');
      const { data, error } = await supabase
        .from('policy_data')
        .update({
          value: formattedValue,
          data_source: source || 'Manual update',
          source_url: sourceUrl || null,
          confidence_level: confidence || 'medium',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      console.log('Creating new policy data entry...');
      const { data, error } = await supabase
        .from('policy_data')
        .insert({
          state_id: state.id,
          metric_id: metric.id,
          effective_date: new Date().toISOString().split('T')[0],
          end_date: null,
          value: formattedValue,
          data_source: source || 'Manual entry',
          source_url: sourceUrl || null,
          confidence_level: confidence || 'medium',
          created_by: 'manual-update-script'
        })
        .select();

      if (error) throw error;
      result = data;
    }

    console.log('✅ Policy data updated successfully!');
    console.log(`   Record ID: ${result[0].id}\n`);

  } catch (error) {
    console.error('❌ Error updating policy:', error.message);
    process.exit(1);
  }
}

updatePolicy();
