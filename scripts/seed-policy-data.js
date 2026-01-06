require('dotenv').config();
const supabase = require('../src/config/database');

// Sample policy data for multiple states
// This includes realistic policy values across different metrics

async function seedPolicyData() {
  console.log('🌱 Starting policy data import...\n');

  try {
    // Get all states
    const { data: states, error: statesError } = await supabase
      .from('states')
      .select('id, code, name');

    if (statesError) throw statesError;

    // Get all metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('policy_metrics')
      .select('id, slug, name, data_type');

    if (metricsError) throw metricsError;

    // Create lookup maps
    const stateMap = {};
    states.forEach(s => stateMap[s.code] = s);

    const metricMap = {};
    metrics.forEach(m => metricMap[m.slug] = m);

    console.log(`📊 Found ${states.length} states and ${metrics.length} metrics`);
    console.log('📝 Preparing sample policy data...\n');

    // Sample policy data for selected states
    const policyData = [
      // CALIFORNIA - Progressive policies
      { state: 'CA', metric: 'income-eligibility-fpl', value: { numeric: 85 }, effective_date: '2024-01-01', source: 'CA Department of Social Services', confidence: 'high' },
      { state: 'CA', metric: 'subsidy-waitlist-size', value: { numeric: 50000 }, effective_date: '2024-01-01', source: 'CA DSS', confidence: 'medium' },
      { state: 'CA', metric: 'subsidy-rate-infant', value: { currency: 1800 }, effective_date: '2024-01-01', source: 'CA DSS', confidence: 'high' },
      { state: 'CA', metric: 'ratio-infant', value: { text: '1:4' }, effective_date: '2024-01-01', source: 'CA Licensing Standards', confidence: 'high' },
      { state: 'CA', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'CA Licensing Standards', confidence: 'high' },
      { state: 'CA', metric: 'centers-per-1000', value: { numeric: 8.5 }, effective_date: '2024-01-01', source: 'CA Child Care Resource Center', confidence: 'medium' },
      { state: 'CA', metric: 'childcare-desert-pct', value: { numeric: 28 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'CA', metric: 'paid-leave-weeks', value: { numeric: 8 }, effective_date: '2024-01-01', source: 'CA EDD', confidence: 'high' },
      { state: 'CA', metric: 'tax-credit-amount', value: { currency: 3000 }, effective_date: '2024-01-01', source: 'CA Franchise Tax Board', confidence: 'high' },
      { state: 'CA', metric: 'avg-worker-wage', value: { currency: 38500 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'CA', metric: 'required-training-hours', value: { numeric: 24 }, effective_date: '2024-01-01', source: 'CA Licensing Standards', confidence: 'high' },

      // TEXAS - More conservative approach
      { state: 'TX', metric: 'income-eligibility-fpl', value: { numeric: 65 }, effective_date: '2024-01-01', source: 'TX Health and Human Services', confidence: 'high' },
      { state: 'TX', metric: 'subsidy-waitlist-size', value: { numeric: 32000 }, effective_date: '2024-01-01', source: 'TX HHS', confidence: 'medium' },
      { state: 'TX', metric: 'subsidy-rate-infant', value: { currency: 950 }, effective_date: '2024-01-01', source: 'TX HHS', confidence: 'high' },
      { state: 'TX', metric: 'ratio-infant', value: { text: '1:4' }, effective_date: '2024-01-01', source: 'TX Minimum Standards', confidence: 'high' },
      { state: 'TX', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'TX Minimum Standards', confidence: 'high' },
      { state: 'TX', metric: 'centers-per-1000', value: { numeric: 6.2 }, effective_date: '2024-01-01', source: 'TX Child Care Data', confidence: 'medium' },
      { state: 'TX', metric: 'childcare-desert-pct', value: { numeric: 42 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'TX', metric: 'paid-leave-weeks', value: { numeric: 0 }, effective_date: '2024-01-01', source: 'TX Labor Code', confidence: 'high' },
      { state: 'TX', metric: 'tax-credit-amount', value: { currency: 0 }, effective_date: '2024-01-01', source: 'TX Tax Code', confidence: 'high' },
      { state: 'TX', metric: 'avg-worker-wage', value: { currency: 28500 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'TX', metric: 'required-training-hours', value: { numeric: 24 }, effective_date: '2024-01-01', source: 'TX Minimum Standards', confidence: 'high' },

      // NEW YORK - Strong worker protections
      { state: 'NY', metric: 'income-eligibility-fpl', value: { numeric: 85 }, effective_date: '2024-01-01', source: 'NY OCFS', confidence: 'high' },
      { state: 'NY', metric: 'subsidy-waitlist-size', value: { numeric: 45000 }, effective_date: '2024-01-01', source: 'NY OCFS', confidence: 'medium' },
      { state: 'NY', metric: 'subsidy-rate-infant', value: { currency: 1650 }, effective_date: '2024-01-01', source: 'NY OCFS', confidence: 'high' },
      { state: 'NY', metric: 'ratio-infant', value: { text: '1:4' }, effective_date: '2024-01-01', source: 'NY OCFS Regulations', confidence: 'high' },
      { state: 'NY', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'NY OCFS Regulations', confidence: 'high' },
      { state: 'NY', metric: 'centers-per-1000', value: { numeric: 7.8 }, effective_date: '2024-01-01', source: 'NY Child Care Data', confidence: 'medium' },
      { state: 'NY', metric: 'childcare-desert-pct', value: { numeric: 31 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'NY', metric: 'paid-leave-weeks', value: { numeric: 12 }, effective_date: '2024-01-01', source: 'NY Paid Family Leave', confidence: 'high' },
      { state: 'NY', metric: 'tax-credit-amount', value: { currency: 2500 }, effective_date: '2024-01-01', source: 'NY Department of Taxation', confidence: 'high' },
      { state: 'NY', metric: 'avg-worker-wage', value: { currency: 36800 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'NY', metric: 'required-training-hours', value: { numeric: 30 }, effective_date: '2024-01-01', source: 'NY OCFS Regulations', confidence: 'high' },

      // FLORIDA - Middle ground
      { state: 'FL', metric: 'income-eligibility-fpl', value: { numeric: 150 }, effective_date: '2024-01-01', source: 'FL Department of Children and Families', confidence: 'high' },
      { state: 'FL', metric: 'subsidy-waitlist-size', value: { numeric: 28000 }, effective_date: '2024-01-01', source: 'FL DCF', confidence: 'medium' },
      { state: 'FL', metric: 'subsidy-rate-infant', value: { currency: 850 }, effective_date: '2024-01-01', source: 'FL DCF', confidence: 'high' },
      { state: 'FL', metric: 'ratio-infant', value: { text: '1:4' }, effective_date: '2024-01-01', source: 'FL Child Care Standards', confidence: 'high' },
      { state: 'FL', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'FL Child Care Standards', confidence: 'high' },
      { state: 'FL', metric: 'centers-per-1000', value: { numeric: 5.9 }, effective_date: '2024-01-01', source: 'FL Child Care Data', confidence: 'medium' },
      { state: 'FL', metric: 'childcare-desert-pct', value: { numeric: 38 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'FL', metric: 'paid-leave-weeks', value: { numeric: 0 }, effective_date: '2024-01-01', source: 'FL Statutes', confidence: 'high' },
      { state: 'FL', metric: 'tax-credit-amount', value: { currency: 0 }, effective_date: '2024-01-01', source: 'FL Tax Code', confidence: 'high' },
      { state: 'FL', metric: 'avg-worker-wage', value: { currency: 29200 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'FL', metric: 'required-training-hours', value: { numeric: 20 }, effective_date: '2024-01-01', source: 'FL Child Care Standards', confidence: 'high' },

      // MASSACHUSETTS - High standards
      { state: 'MA', metric: 'income-eligibility-fpl', value: { numeric: 85 }, effective_date: '2024-01-01', source: 'MA Department of Early Education', confidence: 'high' },
      { state: 'MA', metric: 'subsidy-waitlist-size', value: { numeric: 12000 }, effective_date: '2024-01-01', source: 'MA EEC', confidence: 'medium' },
      { state: 'MA', metric: 'subsidy-rate-infant', value: { currency: 1950 }, effective_date: '2024-01-01', source: 'MA EEC', confidence: 'high' },
      { state: 'MA', metric: 'ratio-infant', value: { text: '1:3' }, effective_date: '2024-01-01', source: 'MA EEC Regulations', confidence: 'high' },
      { state: 'MA', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'MA EEC Regulations', confidence: 'high' },
      { state: 'MA', metric: 'centers-per-1000', value: { numeric: 9.2 }, effective_date: '2024-01-01', source: 'MA Child Care Data', confidence: 'medium' },
      { state: 'MA', metric: 'childcare-desert-pct', value: { numeric: 22 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'MA', metric: 'paid-leave-weeks', value: { numeric: 12 }, effective_date: '2024-01-01', source: 'MA Paid Family Leave', confidence: 'high' },
      { state: 'MA', metric: 'tax-credit-amount', value: { currency: 2800 }, effective_date: '2024-01-01', source: 'MA Department of Revenue', confidence: 'high' },
      { state: 'MA', metric: 'avg-worker-wage', value: { currency: 41200 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'MA', metric: 'required-training-hours', value: { numeric: 20 }, effective_date: '2024-01-01', source: 'MA EEC Regulations', confidence: 'high' },

      // WASHINGTON - Progressive West Coast
      { state: 'WA', metric: 'income-eligibility-fpl', value: { numeric: 200 }, effective_date: '2024-01-01', source: 'WA Department of Children, Youth, and Families', confidence: 'high' },
      { state: 'WA', metric: 'subsidy-waitlist-size', value: { numeric: 15000 }, effective_date: '2024-01-01', source: 'WA DCYF', confidence: 'medium' },
      { state: 'WA', metric: 'subsidy-rate-infant', value: { currency: 1700 }, effective_date: '2024-01-01', source: 'WA DCYF', confidence: 'high' },
      { state: 'WA', metric: 'ratio-infant', value: { text: '1:4' }, effective_date: '2024-01-01', source: 'WA Child Care Standards', confidence: 'high' },
      { state: 'WA', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'WA Child Care Standards', confidence: 'high' },
      { state: 'WA', metric: 'centers-per-1000', value: { numeric: 7.5 }, effective_date: '2024-01-01', source: 'WA Child Care Data', confidence: 'medium' },
      { state: 'WA', metric: 'childcare-desert-pct', value: { numeric: 30 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'WA', metric: 'paid-leave-weeks', value: { numeric: 12 }, effective_date: '2024-01-01', source: 'WA Paid Family Leave', confidence: 'high' },
      { state: 'WA', metric: 'tax-credit-amount', value: { currency: 1200 }, effective_date: '2024-01-01', source: 'WA Department of Revenue', confidence: 'high' },
      { state: 'WA', metric: 'avg-worker-wage', value: { currency: 39500 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'WA', metric: 'required-training-hours', value: { numeric: 30 }, effective_date: '2024-01-01', source: 'WA Child Care Standards', confidence: 'high' },

      // MISSISSIPPI - Lower resources
      { state: 'MS', metric: 'income-eligibility-fpl', value: { numeric: 85 }, effective_date: '2024-01-01', source: 'MS Department of Human Services', confidence: 'high' },
      { state: 'MS', metric: 'subsidy-waitlist-size', value: { numeric: 8000 }, effective_date: '2024-01-01', source: 'MS DHS', confidence: 'medium' },
      { state: 'MS', metric: 'subsidy-rate-infant', value: { currency: 650 }, effective_date: '2024-01-01', source: 'MS DHS', confidence: 'high' },
      { state: 'MS', metric: 'ratio-infant', value: { text: '1:5' }, effective_date: '2024-01-01', source: 'MS Child Care Standards', confidence: 'high' },
      { state: 'MS', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'MS Child Care Standards', confidence: 'high' },
      { state: 'MS', metric: 'centers-per-1000', value: { numeric: 4.1 }, effective_date: '2024-01-01', source: 'MS Child Care Data', confidence: 'medium' },
      { state: 'MS', metric: 'childcare-desert-pct', value: { numeric: 52 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'MS', metric: 'paid-leave-weeks', value: { numeric: 0 }, effective_date: '2024-01-01', source: 'MS Labor Laws', confidence: 'high' },
      { state: 'MS', metric: 'tax-credit-amount', value: { currency: 0 }, effective_date: '2024-01-01', source: 'MS Tax Code', confidence: 'high' },
      { state: 'MS', metric: 'avg-worker-wage', value: { currency: 23800 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'MS', metric: 'required-training-hours', value: { numeric: 15 }, effective_date: '2024-01-01', source: 'MS Child Care Standards', confidence: 'high' },

      // COLORADO - Mountain West progressive
      { state: 'CO', metric: 'income-eligibility-fpl', value: { numeric: 185 }, effective_date: '2024-01-01', source: 'CO Department of Human Services', confidence: 'high' },
      { state: 'CO', metric: 'subsidy-waitlist-size', value: { numeric: 18000 }, effective_date: '2024-01-01', source: 'CO DHS', confidence: 'medium' },
      { state: 'CO', metric: 'subsidy-rate-infant', value: { currency: 1450 }, effective_date: '2024-01-01', source: 'CO DHS', confidence: 'high' },
      { state: 'CO', metric: 'ratio-infant', value: { text: '1:5' }, effective_date: '2024-01-01', source: 'CO Child Care Regulations', confidence: 'high' },
      { state: 'CO', metric: 'annual-inspection', value: { boolean: true }, effective_date: '2024-01-01', source: 'CO Child Care Regulations', confidence: 'high' },
      { state: 'CO', metric: 'centers-per-1000', value: { numeric: 6.8 }, effective_date: '2024-01-01', source: 'CO Child Care Data', confidence: 'medium' },
      { state: 'CO', metric: 'childcare-desert-pct', value: { numeric: 35 }, effective_date: '2024-01-01', source: 'Center for American Progress', confidence: 'medium' },
      { state: 'CO', metric: 'paid-leave-weeks', value: { numeric: 12 }, effective_date: '2024-01-01', source: 'CO FAMLI', confidence: 'high' },
      { state: 'CO', metric: 'tax-credit-amount', value: { currency: 2100 }, effective_date: '2024-01-01', source: 'CO Department of Revenue', confidence: 'high' },
      { state: 'CO', metric: 'avg-worker-wage', value: { currency: 35600 }, effective_date: '2024-01-01', source: 'Bureau of Labor Statistics', confidence: 'high' },
      { state: 'CO', metric: 'required-training-hours', value: { numeric: 25 }, effective_date: '2024-01-01', source: 'CO Child Care Regulations', confidence: 'high' },
    ];

    // Transform data to match database structure
    const records = [];
    for (const item of policyData) {
      const state = stateMap[item.state];
      const metric = metricMap[item.metric];

      if (!state || !metric) {
        console.warn(`⚠️  Skipping: state=${item.state}, metric=${item.metric} (not found)`);
        continue;
      }

      records.push({
        state_id: state.id,
        metric_id: metric.id,
        effective_date: item.effective_date,
        end_date: null, // Current policy
        value: item.value,
        data_source: item.source,
        confidence_level: item.confidence,
        created_by: 'seed-script'
      });
    }

    console.log(`📥 Prepared ${records.length} policy data records`);
    console.log('💾 Inserting into database...\n');

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('policy_data')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        continue;
      }

      inserted += data.length;
      process.stdout.write(`   Inserted ${inserted}/${records.length} records...\r`);
    }

    console.log(`\n✅ Successfully imported ${inserted} policy data records!\n`);

    // Show summary
    const statesSummary = {};
    policyData.forEach(item => {
      if (!statesSummary[item.state]) {
        statesSummary[item.state] = 0;
      }
      statesSummary[item.state]++;
    });

    console.log('📊 Summary by state:');
    Object.keys(statesSummary).sort().forEach(state => {
      const stateName = stateMap[state]?.name || state;
      console.log(`   ${state} (${stateName}): ${statesSummary[state]} metrics`);
    });

    console.log('\n🎉 Policy data import complete!');
    console.log('\n💡 Try these API endpoints:');
    console.log('   GET /api/data/state/CA');
    console.log('   GET /api/data/metric/income-eligibility-fpl/comparison');
    console.log('   GET /api/data/compare?stateCodes=CA,TX,NY');

  } catch (error) {
    console.error('❌ Error importing policy data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seedPolicyData();
