require('dotenv').config();
const supabase = require('../src/config/database');

async function validateData() {
  console.log('\n🔍 Child Care Policy Data Validation Report');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Get all states
    const { data: states } = await supabase
      .from('states')
      .select('id, code, name')
      .order('code');

    // Get all metrics
    const { data: metrics } = await supabase
      .from('policy_metrics')
      .select('id, slug, name')
      .order('name');

    // Get all policy data
    const { data: policyData } = await supabase
      .from('policy_data')
      .select('state_id, metric_id, confidence_level, data_source, created_by')
      .is('end_date', null);

    console.log(`📊 Database Overview:`);
    console.log(`   States: ${states.length}`);
    console.log(`   Metrics: ${metrics.length}`);
    console.log(`   Policy Records: ${policyData.length}`);
    console.log(`   Expected Records: ${states.length * metrics.length}`);
    console.log('');

    // Calculate completeness
    const expectedRecords = states.length * metrics.length;
    const completeness = (policyData.length / expectedRecords * 100).toFixed(1);
    console.log(`✅ Data Completeness: ${completeness}%`);
    console.log('');

    // Find missing data
    const missingData = [];
    for (const state of states) {
      for (const metric of metrics) {
        const exists = policyData.some(
          p => p.state_id === state.id && p.metric_id === metric.id
        );
        if (!exists) {
          missingData.push({ state: state.code, metric: metric.slug });
        }
      }
    }

    if (missingData.length > 0) {
      console.log(`⚠️  Missing Data: ${missingData.length} records`);
      if (missingData.length <= 20) {
        missingData.forEach(item => {
          console.log(`   - ${item.state}: ${item.metric}`);
        });
      } else {
        console.log(`   (Too many to display - ${missingData.length} total)`);
      }
      console.log('');
    }

    // Data quality by confidence level
    const qualityBreakdown = {
      high: policyData.filter(p => p.confidence_level === 'high').length,
      medium: policyData.filter(p => p.confidence_level === 'medium').length,
      low: policyData.filter(p => p.confidence_level === 'low').length
    };

    console.log('📈 Data Quality Breakdown:');
    console.log(`   High Confidence: ${qualityBreakdown.high} (${(qualityBreakdown.high / policyData.length * 100).toFixed(1)}%)`);
    console.log(`   Medium Confidence: ${qualityBreakdown.medium} (${(qualityBreakdown.medium / policyData.length * 100).toFixed(1)}%)`);
    console.log(`   Low Confidence: ${qualityBreakdown.low} (${(qualityBreakdown.low / policyData.length * 100).toFixed(1)}%)`);
    console.log('');

    // Data source breakdown
    const generatedData = policyData.filter(p =>
      p.created_by === 'seed-script-generated' ||
      p.data_source?.includes('Generated based on')
    ).length;

    const manualData = policyData.filter(p =>
      p.created_by === 'seed-script' ||
      p.created_by === 'interactive-entry' ||
      p.created_by === 'manual-update-script'
    ).length;

    console.log('📚 Data Sources:');
    console.log(`   Generated/Estimated: ${generatedData} (${(generatedData / policyData.length * 100).toFixed(1)}%)`);
    console.log(`   Hand-Entered/Verified: ${manualData} (${(manualData / policyData.length * 100).toFixed(1)}%)`);
    console.log('');

    // States with low data quality
    const statesNeedingWork = [];
    for (const state of states) {
      const statePolicies = policyData.filter(p => p.state_id === state.id);
      const generated = statePolicies.filter(p =>
        p.created_by === 'seed-script-generated' ||
        p.data_source?.includes('Generated based on')
      ).length;

      const generatedPct = (generated / statePolicies.length * 100);
      if (generatedPct > 50) {
        statesNeedingWork.push({
          code: state.code,
          name: state.name,
          generatedPct: generatedPct.toFixed(0)
        });
      }
    }

    if (statesNeedingWork.length > 0) {
      console.log(`🎯 Priority States Needing Real Data (>50% generated):`);
      statesNeedingWork
        .sort((a, b) => b.generatedPct - a.generatedPct)
        .slice(0, 10)
        .forEach(state => {
          console.log(`   ${state.code} (${state.name}): ${state.generatedPct}% generated`);
        });
      console.log('');
    }

    // Metrics needing attention
    const metricsNeedingWork = [];
    for (const metric of metrics) {
      const metricPolicies = policyData.filter(p => p.metric_id === metric.id);
      const lowConfidence = metricPolicies.filter(p => p.confidence_level === 'low').length;
      const lowConfidencePct = (lowConfidence / metricPolicies.length * 100);

      if (lowConfidencePct > 30) {
        metricsNeedingWork.push({
          slug: metric.slug,
          name: metric.name,
          lowPct: lowConfidencePct.toFixed(0)
        });
      }
    }

    if (metricsNeedingWork.length > 0) {
      console.log(`📊 Metrics with Low Confidence Data (>30%):`);
      metricsNeedingWork.forEach(metric => {
        console.log(`   ${metric.name}: ${metric.lowPct}% low confidence`);
      });
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (completeness < 100) {
      console.log(`   1. Fill in missing ${expectedRecords - policyData.length} policy records`);
    }
    if (generatedData > policyData.length * 0.5) {
      console.log(`   2. Replace generated data with verified sources`);
    }
    if (qualityBreakdown.low > 0) {
      console.log(`   3. Improve ${qualityBreakdown.low} low-confidence records`);
    }
    if (statesNeedingWork.length > 0) {
      console.log(`   4. Start with high-population states: ${statesNeedingWork.slice(0, 3).map(s => s.code).join(', ')}`);
    }
    console.log(`   5. Use official state agency websites (see DATA_SOURCES.md)`);
    console.log(`   6. Run 'node scripts/interactive-data-entry.js' to update data`);
    console.log('');

    // Summary score
    const qualityScore = (
      (qualityBreakdown.high * 1.0 +
       qualityBreakdown.medium * 0.6 +
       qualityBreakdown.low * 0.3) /
      policyData.length * 100
    ).toFixed(1);

    console.log(`📊 Overall Data Quality Score: ${qualityScore}/100`);
    console.log('');

    if (qualityScore >= 80) {
      console.log('🌟 Excellent! Your data is high quality.');
    } else if (qualityScore >= 60) {
      console.log('✅ Good! Consider improving low-confidence records.');
    } else if (qualityScore >= 40) {
      console.log('⚠️  Fair. Focus on replacing generated data.');
    } else {
      console.log('❌ Needs improvement. Most data is generated/estimated.');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error validating data:', error.message);
    process.exit(1);
  }
}

validateData();
