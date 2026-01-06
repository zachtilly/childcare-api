require('dotenv').config();
const supabase = require('../src/config/database');

// States that already have data
const EXISTING_STATES = ['CA', 'TX', 'NY', 'FL', 'MA', 'WA', 'MS', 'CO'];

// Regional policy patterns (used for generating realistic values)
const REGIONAL_PATTERNS = {
  Northeast: {
    income_eligibility_multiplier: 1.0,
    subsidy_rate_multiplier: 1.4,
    paid_leave_likelihood: 0.7,
    tax_credit_multiplier: 1.3,
    wage_multiplier: 1.2,
    training_hours_base: 22
  },
  South: {
    income_eligibility_multiplier: 0.85,
    subsidy_rate_multiplier: 0.75,
    paid_leave_likelihood: 0.1,
    tax_credit_multiplier: 0.3,
    wage_multiplier: 0.85,
    training_hours_base: 18
  },
  Midwest: {
    income_eligibility_multiplier: 0.95,
    subsidy_rate_multiplier: 0.9,
    paid_leave_likelihood: 0.3,
    tax_credit_multiplier: 0.8,
    wage_multiplier: 0.95,
    training_hours_base: 20
  },
  West: {
    income_eligibility_multiplier: 1.1,
    subsidy_rate_multiplier: 1.2,
    paid_leave_likelihood: 0.5,
    tax_credit_multiplier: 1.1,
    wage_multiplier: 1.15,
    training_hours_base: 24
  }
};

// Generate policy value based on state characteristics
function generatePolicyData(state, metric) {
  const pattern = REGIONAL_PATTERNS[state.region] || REGIONAL_PATTERNS.Midwest;
  const incomeLevel = state.median_household_income || 65000;
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (metric.slug) {
    case 'income-eligibility-fpl':
      // Higher income states tend to have higher eligibility
      const base = incomeLevel > 75000 ? 150 : incomeLevel > 60000 ? 100 : 85;
      return { numeric: Math.round(base * pattern.income_eligibility_multiplier) };

    case 'subsidy-waitlist-size':
      // Larger states have larger waitlists
      const popFactor = state.population / 1000000;
      return { numeric: Math.round(random(5000, 15000) * popFactor) };

    case 'subsidy-rate-infant':
      // Based on regional cost of living
      const baseRate = incomeLevel > 75000 ? 1200 : incomeLevel > 60000 ? 900 : 750;
      return { currency: Math.round(baseRate * pattern.subsidy_rate_multiplier) };

    case 'ratio-infant':
      // Most states use 1:4, some stricter states use 1:3, some looser use 1:5
      const ratios = pattern.income_eligibility_multiplier > 1
        ? ['1:3', '1:4', '1:4']
        : ['1:4', '1:4', '1:5'];
      return { text: ratios[random(0, ratios.length - 1)] };

    case 'teacher-education-req':
      // Not in our seed data, skip
      return null;

    case 'annual-inspection':
      // Almost all states require annual inspection
      return { boolean: true };

    case 'centers-per-1000':
      // Wealthier, more urban states have more centers
      const centerBase = incomeLevel > 75000 ? 7.5 : incomeLevel > 60000 ? 6.0 : 5.0;
      return { numeric: Number((centerBase + (Math.random() * 2 - 1)).toFixed(1)) };

    case 'childcare-desert-pct':
      // Rural, lower-income states have more deserts
      const desertBase = incomeLevel > 75000 ? 28 : incomeLevel > 60000 ? 35 : 45;
      return { numeric: desertBase + random(-5, 10) };

    case 'paid-leave-weeks':
      // Progressive states more likely to have paid leave
      const hasPaidLeave = Math.random() < pattern.paid_leave_likelihood;
      return { numeric: hasPaidLeave ? random(8, 12) : 0 };

    case 'tax-credit-amount':
      // Wealthier states tend to have tax credits
      const hasCredit = pattern.tax_credit_multiplier > 0.5;
      const creditBase = incomeLevel > 75000 ? 2500 : incomeLevel > 60000 ? 1500 : 500;
      return { currency: hasCredit ? Math.round(creditBase * pattern.tax_credit_multiplier) : 0 };

    case 'avg-worker-wage':
      // Based on regional wages and cost of living
      const wageBase = 30000;
      const wageAdjustment = (incomeLevel - 65000) / 1000 * 100;
      return { currency: Math.round((wageBase + wageAdjustment) * pattern.wage_multiplier) };

    case 'required-training-hours':
      // Progressive states require more training
      return { numeric: pattern.training_hours_base + random(-3, 5) };

    default:
      return null;
  }
}

async function seedRemainingStates() {
  console.log('🌱 Starting policy data import for remaining states...\n');

  try {
    // Get all states
    const { data: allStates, error: statesError } = await supabase
      .from('states')
      .select('id, code, name, region, population, median_household_income')
      .order('code');

    if (statesError) throw statesError;

    // Filter out states that already have data
    const remainingStates = allStates.filter(s => !EXISTING_STATES.includes(s.code));

    console.log(`📊 Found ${remainingStates.length} states without policy data`);
    console.log(`   (${EXISTING_STATES.length} states already have data)\n`);

    // Get all metrics (excluding teacher-education-req which we're not populating)
    const { data: metrics, error: metricsError } = await supabase
      .from('policy_metrics')
      .select('id, slug, name, data_type')
      .not('slug', 'eq', 'teacher-education-req');

    if (metricsError) throw metricsError;

    console.log(`📝 Generating data for ${metrics.length} metrics per state...\n`);

    // Generate policy data
    const policyRecords = [];
    let skipped = 0;

    for (const state of remainingStates) {
      for (const metric of metrics) {
        const value = generatePolicyData(state, metric);

        if (!value) {
          skipped++;
          continue;
        }

        policyRecords.push({
          state_id: state.id,
          metric_id: metric.id,
          effective_date: '2024-01-01',
          end_date: null,
          value: value,
          data_source: `Generated based on ${state.region} regional patterns`,
          confidence_level: 'medium',
          created_by: 'seed-script-generated'
        });
      }
    }

    console.log(`📥 Generated ${policyRecords.length} policy data records`);
    if (skipped > 0) {
      console.log(`   (Skipped ${skipped} records)`);
    }
    console.log('💾 Inserting into database...\n');

    // Insert in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < policyRecords.length; i += batchSize) {
      const batch = policyRecords.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('policy_data')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        continue;
      }

      inserted += data.length;
      process.stdout.write(`   Inserted ${inserted}/${policyRecords.length} records...\r`);
    }

    console.log(`\n✅ Successfully imported ${inserted} policy data records!\n`);

    // Show summary by region
    const regionSummary = {};
    remainingStates.forEach(state => {
      if (!regionSummary[state.region]) {
        regionSummary[state.region] = [];
      }
      regionSummary[state.region].push(state.code);
    });

    console.log('📊 Summary by region:');
    Object.keys(regionSummary).sort().forEach(region => {
      console.log(`   ${region}: ${regionSummary[region].length} states (${regionSummary[region].sort().join(', ')})`);
    });

    console.log('\n🎉 Policy data import complete!');
    console.log(`\n📈 Total states with data: ${EXISTING_STATES.length + remainingStates.length} / 50`);
    console.log('\n💡 Try these API endpoints:');
    console.log('   GET /api/data/metric/income-eligibility-fpl/comparison');
    console.log('   GET /api/data/compare?stateCodes=CA,TX,NY,IL,GA');

  } catch (error) {
    console.error('❌ Error importing policy data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seedRemainingStates();
