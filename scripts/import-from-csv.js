require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const supabase = require('../src/config/database');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function validateRow(row, lineNum) {
  const errors = [];

  // Required fields
  if (!row.state_code) errors.push(`Line ${lineNum}: Missing state_code`);
  if (!row.metric_slug) errors.push(`Line ${lineNum}: Missing metric_slug`);
  if (!row.value) errors.push(`Line ${lineNum}: Missing value`);
  if (!row.data_source) errors.push(`Line ${lineNum}: Missing data_source`);
  if (!row.confidence_level) errors.push(`Line ${lineNum}: Missing confidence_level`);

  // Validate state code format
  if (row.state_code && !/^[A-Z]{2}$/.test(row.state_code)) {
    errors.push(`Line ${lineNum}: Invalid state_code '${row.state_code}' (must be 2 uppercase letters)`);
  }

  // Validate confidence level
  if (row.confidence_level && !['high', 'medium', 'low'].includes(row.confidence_level.toLowerCase())) {
    errors.push(`Line ${lineNum}: Invalid confidence_level '${row.confidence_level}' (must be high, medium, or low)`);
  }

  return errors;
}

function formatValue(value, dataType) {
  switch (dataType) {
    case 'numeric':
    case 'percentage':
      return { numeric: parseFloat(value) };
    case 'currency':
      // Remove any non-numeric characters except decimals
      const numValue = value.toString().replace(/[^0-9.]/g, '');
      return { currency: parseInt(numValue) };
    case 'boolean':
      const boolValue = value.toString().toLowerCase();
      return { boolean: boolValue === 'true' || boolValue === 'yes' || boolValue === '1' };
    case 'text':
      return { text: value.toString() };
    default:
      return { text: value.toString() };
  }
}

async function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function importFromCSV() {
  const csvFile = process.argv[2];

  if (!csvFile) {
    console.log('Usage: node scripts/import-from-csv.js <csv_file>');
    console.log('\nExample:');
    console.log('  node scripts/import-from-csv.js BULK_IMPORT_TEMPLATE.csv');
    process.exit(1);
  }

  console.log('\n📥 CSV Bulk Import Tool');
  console.log('='.repeat(60));
  console.log('');

  // Read CSV file
  console.log(`📂 Reading file: ${csvFile}`);
  let csvContent;
  try {
    csvContent = fs.readFileSync(csvFile, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }

  // Parse CSV
  const rows = parseCSV(csvContent);
  console.log(`📊 Found ${rows.length} rows to import\n`);

  if (rows.length === 0) {
    console.log('❌ No data rows found in CSV');
    process.exit(1);
  }

  // Validate all rows
  console.log('🔍 Validating data...');
  const allErrors = [];
  rows.forEach((row, idx) => {
    const errors = validateRow(row, idx + 2); // +2 because line 1 is header, array is 0-indexed
    allErrors.push(...errors);
  });

  if (allErrors.length > 0) {
    console.log(`\n❌ Validation errors found:\n`);
    allErrors.forEach(err => console.log(`   ${err}`));
    console.log('\nPlease fix these errors and try again.');
    process.exit(1);
  }

  console.log('✅ Validation passed\n');

  // Get states and metrics from database
  const { data: states } = await supabase.from('states').select('id, code');
  const { data: metrics } = await supabase.from('policy_metrics').select('id, slug, data_type');

  const stateMap = {};
  states.forEach(s => stateMap[s.code] = s);

  const metricMap = {};
  metrics.forEach(m => metricMap[m.slug] = m);

  // Check for invalid state codes or metrics
  const invalidStates = [];
  const invalidMetrics = [];

  rows.forEach((row, idx) => {
    if (!stateMap[row.state_code]) {
      invalidStates.push(`Line ${idx + 2}: Unknown state '${row.state_code}'`);
    }
    if (!metricMap[row.metric_slug]) {
      invalidMetrics.push(`Line ${idx + 2}: Unknown metric '${row.metric_slug}'`);
    }
  });

  if (invalidStates.length > 0 || invalidMetrics.length > 0) {
    console.log('❌ Validation errors:\n');
    [...invalidStates, ...invalidMetrics].forEach(err => console.log(`   ${err}`));
    process.exit(1);
  }

  // Show preview
  console.log('📋 Preview (first 5 rows):');
  rows.slice(0, 5).forEach((row, idx) => {
    console.log(`   ${idx + 1}. ${row.state_code} - ${row.metric_slug}: ${row.value}`);
  });
  if (rows.length > 5) {
    console.log(`   ... and ${rows.length - 5} more rows`);
  }
  console.log('');

  // Group by state for summary
  const statesSummary = {};
  rows.forEach(row => {
    if (!statesSummary[row.state_code]) {
      statesSummary[row.state_code] = 0;
    }
    statesSummary[row.state_code]++;
  });

  console.log('📊 Summary by state:');
  Object.entries(statesSummary).forEach(([code, count]) => {
    console.log(`   ${code}: ${count} metrics`);
  });
  console.log('');

  // Confirm
  const confirm = await question('Proceed with import? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Import cancelled');
    process.exit(0);
  }

  // Import data
  console.log('\n💾 Importing data...\n');

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const state = stateMap[row.state_code];
    const metric = metricMap[row.metric_slug];

    try {
      const formattedValue = formatValue(row.value, metric.data_type);

      // Check if exists
      const { data: existing } = await supabase
        .from('policy_data')
        .select('id')
        .eq('state_id', state.id)
        .eq('metric_id', metric.id)
        .is('end_date', null)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('policy_data')
          .update({
            value: formattedValue,
            data_source: row.data_source,
            source_url: row.source_url || null,
            confidence_level: row.confidence_level.toLowerCase(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        updated++;
      } else {
        // Insert
        const { error } = await supabase
          .from('policy_data')
          .insert({
            state_id: state.id,
            metric_id: metric.id,
            effective_date: new Date().toISOString().split('T')[0],
            end_date: null,
            value: formattedValue,
            data_source: row.data_source,
            source_url: row.source_url || null,
            confidence_level: row.confidence_level.toLowerCase(),
            created_by: 'csv-import'
          });

        if (error) throw error;
        inserted++;
      }

      process.stdout.write(`   Progress: ${i + 1}/${rows.length} (${inserted} new, ${updated} updated, ${errors} errors)\r`);

    } catch (error) {
      console.log(`\n   ❌ Error on row ${i + 2}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n\n✅ Import complete!`);
  console.log(`   ${inserted} records inserted`);
  console.log(`   ${updated} records updated`);
  if (errors > 0) {
    console.log(`   ${errors} errors`);
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Run validation: node scripts/validate-data.js');
  console.log('   2. Check dashboard: http://localhost:5173');
  console.log('   3. Verify data: curl http://localhost:3000/api/data/state/XX');
  console.log('');
}

importFromCSV().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
