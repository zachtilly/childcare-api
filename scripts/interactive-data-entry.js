require('dotenv').config();
const readline = require('readline');
const supabase = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n===========================================');
  console.log('  Child Care Policy Data Entry Tool');
  console.log('===========================================\n');

  try {
    // Get all states
    const { data: states } = await supabase
      .from('states')
      .select('code, name')
      .order('name');

    // Get all metrics
    const { data: metrics } = await supabase
      .from('policy_metrics')
      .select('slug, name, data_type, unit, description')
      .order('name');

    console.log('Available states:', states.map(s => s.code).join(', '));
    console.log('');

    const stateCode = (await question('Enter state code (e.g., CA): ')).toUpperCase().trim();
    const state = states.find(s => s.code === stateCode);

    if (!state) {
      console.log('❌ Invalid state code');
      rl.close();
      return;
    }

    console.log(`\nSelected: ${state.name}\n`);
    console.log('Available metrics:');
    metrics.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} (${m.slug})`);
      console.log(`     Type: ${m.data_type}${m.unit ? ', Unit: ' + m.unit : ''}`);
    });

    console.log('');
    const metricNum = await question('Enter metric number: ');
    const metric = metrics[parseInt(metricNum) - 1];

    if (!metric) {
      console.log('❌ Invalid metric number');
      rl.close();
      return;
    }

    console.log(`\nSelected: ${metric.name}`);
    console.log(`Description: ${metric.description}`);
    console.log(`Data Type: ${metric.data_type}${metric.unit ? ' (' + metric.unit + ')' : ''}\n`);

    let valuePrompt = 'Enter value: ';
    if (metric.data_type === 'boolean') {
      valuePrompt = 'Enter value (yes/no or true/false): ';
    } else if (metric.data_type === 'currency') {
      valuePrompt = 'Enter value (USD, numbers only): ';
    }

    const value = await question(valuePrompt);
    const source = await question('Data source (e.g., "CA Department of Social Services"): ');
    const sourceUrl = await question('Source URL (optional, press enter to skip): ');
    const confidence = await question('Confidence level (high/medium/low, default: medium): ') || 'medium';

    // Format value based on data type
    let formattedValue;
    switch (metric.data_type) {
      case 'numeric':
      case 'percentage':
        formattedValue = { numeric: parseFloat(value) };
        break;
      case 'currency':
        formattedValue = { currency: parseInt(value.replace(/[^0-9]/g, '')) };
        break;
      case 'boolean':
        const boolValue = value.toLowerCase();
        formattedValue = { boolean: boolValue === 'true' || boolValue === 'yes' || boolValue === '1' };
        break;
      case 'text':
        formattedValue = { text: value };
        break;
      default:
        formattedValue = { text: value };
    }

    console.log('\n📝 Summary:');
    console.log(`   State: ${state.name}`);
    console.log(`   Metric: ${metric.name}`);
    console.log(`   Value: ${JSON.stringify(formattedValue)}`);
    console.log(`   Source: ${source}`);
    if (sourceUrl) console.log(`   URL: ${sourceUrl}`);
    console.log(`   Confidence: ${confidence}\n`);

    const confirm = await question('Save this data? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      rl.close();
      return;
    }

    // Get state and metric IDs
    const { data: stateData } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode)
      .single();

    const { data: metricData } = await supabase
      .from('policy_metrics')
      .select('id')
      .eq('slug', metric.slug)
      .single();

    // Check if exists
    const { data: existing } = await supabase
      .from('policy_data')
      .select('id')
      .eq('state_id', stateData.id)
      .eq('metric_id', metricData.id)
      .is('end_date', null)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('policy_data')
        .update({
          value: formattedValue,
          data_source: source,
          source_url: sourceUrl || null,
          confidence_level: confidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
      console.log('✅ Policy data updated successfully!');
    } else {
      // Insert
      const { error } = await supabase
        .from('policy_data')
        .insert({
          state_id: stateData.id,
          metric_id: metricData.id,
          effective_date: new Date().toISOString().split('T')[0],
          end_date: null,
          value: formattedValue,
          data_source: source,
          source_url: sourceUrl || null,
          confidence_level: confidence,
          created_by: 'interactive-entry'
        });

      if (error) throw error;
      console.log('✅ Policy data created successfully!');
    }

    const another = await question('\nEnter another policy? (yes/no): ');
    if (another.toLowerCase() === 'yes' || another.toLowerCase() === 'y') {
      console.log('\n');
      main(); // Recurse for another entry
    } else {
      rl.close();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
}

rl.on('close', () => {
  console.log('\n👋 Goodbye!\n');
  process.exit(0);
});

main();
