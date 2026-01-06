require('dotenv').config();
const supabase = require('../src/config/database');

const states = [
  // Northeast
  { code: 'CT', name: 'Connecticut', region: 'Northeast', population: 3626205, median_household_income: 83771 },
  { code: 'ME', name: 'Maine', region: 'Northeast', population: 1395722, median_household_income: 68251 },
  { code: 'MA', name: 'Massachusetts', region: 'Northeast', population: 7001399, median_household_income: 89026 },
  { code: 'NH', name: 'New Hampshire', region: 'Northeast', population: 1395231, median_household_income: 88841 },
  { code: 'NJ', name: 'New Jersey', region: 'Northeast', population: 9290841, median_household_income: 89296 },
  { code: 'NY', name: 'New York', region: 'Northeast', population: 19571216, median_household_income: 75157 },
  { code: 'PA', name: 'Pennsylvania', region: 'Northeast', population: 12961683, median_household_income: 68957 },
  { code: 'RI', name: 'Rhode Island', region: 'Northeast', population: 1095962, median_household_income: 74008 },
  { code: 'VT', name: 'Vermont', region: 'Northeast', population: 647464, median_household_income: 72431 },

  // South
  { code: 'AL', name: 'Alabama', region: 'South', population: 5108468, median_household_income: 56929 },
  { code: 'AR', name: 'Arkansas', region: 'South', population: 3067732, median_household_income: 52528 },
  { code: 'DE', name: 'Delaware', region: 'South', population: 1031890, median_household_income: 79325 },
  { code: 'FL', name: 'Florida', region: 'South', population: 22610726, median_household_income: 63062 },
  { code: 'GA', name: 'Georgia', region: 'South', population: 11029227, median_household_income: 66559 },
  { code: 'KY', name: 'Kentucky', region: 'South', population: 4512310, median_household_income: 58206 },
  { code: 'LA', name: 'Louisiana', region: 'South', population: 4573749, median_household_income: 54622 },
  { code: 'MD', name: 'Maryland', region: 'South', population: 6164660, median_household_income: 94991 },
  { code: 'MS', name: 'Mississippi', region: 'South', population: 2939690, median_household_income: 49111 },
  { code: 'NC', name: 'North Carolina', region: 'South', population: 10835491, median_household_income: 63472 },
  { code: 'OK', name: 'Oklahoma', region: 'South', population: 4053824, median_household_income: 57826 },
  { code: 'SC', name: 'South Carolina', region: 'South', population: 5373555, median_household_income: 61100 },
  { code: 'TN', name: 'Tennessee', region: 'South', population: 7126489, median_household_income: 61929 },
  { code: 'TX', name: 'Texas', region: 'South', population: 30503301, median_household_income: 66963 },
  { code: 'VA', name: 'Virginia', region: 'South', population: 8715698, median_household_income: 80268 },
  { code: 'WV', name: 'West Virginia', region: 'South', population: 1770071, median_household_income: 51248 },

  // Midwest
  { code: 'IL', name: 'Illinois', region: 'Midwest', population: 12549689, median_household_income: 72205 },
  { code: 'IN', name: 'Indiana', region: 'Midwest', population: 6862199, median_household_income: 62743 },
  { code: 'IA', name: 'Iowa', region: 'Midwest', population: 3207004, median_household_income: 65429 },
  { code: 'KS', name: 'Kansas', region: 'Midwest', population: 2940546, median_household_income: 64521 },
  { code: 'MI', name: 'Michigan', region: 'Midwest', population: 10037261, median_household_income: 63202 },
  { code: 'MN', name: 'Minnesota', region: 'Midwest', population: 5737915, median_household_income: 77720 },
  { code: 'MO', name: 'Missouri', region: 'Midwest', population: 6196156, median_household_income: 61043 },
  { code: 'NE', name: 'Nebraska', region: 'Midwest', population: 1978379, median_household_income: 66644 },
  { code: 'ND', name: 'North Dakota', region: 'Midwest', population: 783926, median_household_income: 68882 },
  { code: 'OH', name: 'Ohio', region: 'Midwest', population: 11785935, median_household_income: 62262 },
  { code: 'SD', name: 'South Dakota', region: 'Midwest', population: 919318, median_household_income: 63920 },
  { code: 'WI', name: 'Wisconsin', region: 'Midwest', population: 5910955, median_household_income: 67125 },

  // West
  { code: 'AK', name: 'Alaska', region: 'West', population: 733406, median_household_income: 80287 },
  { code: 'AZ', name: 'Arizona', region: 'West', population: 7431344, median_household_income: 65913 },
  { code: 'CA', name: 'California', region: 'West', population: 38965193, median_household_income: 84097 },
  { code: 'CO', name: 'Colorado', region: 'West', population: 5877610, median_household_income: 82254 },
  { code: 'HI', name: 'Hawaii', region: 'West', population: 1435138, median_household_income: 88005 },
  { code: 'ID', name: 'Idaho', region: 'West', population: 1964726, median_household_income: 63377 },
  { code: 'MT', name: 'Montana', region: 'West', population: 1122867, median_household_income: 60560 },
  { code: 'NV', name: 'Nevada', region: 'West', population: 3194176, median_household_income: 67276 },
  { code: 'NM', name: 'New Mexico', region: 'West', population: 2114371, median_household_income: 54384 },
  { code: 'OR', name: 'Oregon', region: 'West', population: 4233358, median_household_income: 71562 },
  { code: 'UT', name: 'Utah', region: 'West', population: 3417734, median_household_income: 79133 },
  { code: 'WA', name: 'Washington', region: 'West', population: 7812880, median_household_income: 84247 },
  { code: 'WY', name: 'Wyoming', region: 'West', population: 584057, median_household_income: 68002 }
];

async function seedStates() {
  console.log('🌱 Starting state data import...\n');

  try {
    // Check if states already exist
    const { data: existingStates, error: checkError } = await supabase
      .from('states')
      .select('code');

    if (checkError) {
      throw checkError;
    }

    if (existingStates && existingStates.length > 0) {
      console.log(`⚠️  Found ${existingStates.length} existing states in database.`);
      console.log('   Skipping import to avoid duplicates.');
      console.log('   Delete existing states first if you want to re-import.\n');
      return;
    }

    // Insert states
    console.log(`📍 Inserting ${states.length} states...`);

    const { data, error } = await supabase
      .from('states')
      .insert(states)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully imported ${data.length} states!\n`);

    // Show summary by region
    const regions = {};
    data.forEach(state => {
      if (!regions[state.region]) {
        regions[state.region] = [];
      }
      regions[state.region].push(state.code);
    });

    console.log('📊 Summary by region:');
    Object.keys(regions).sort().forEach(region => {
      console.log(`   ${region}: ${regions[region].length} states (${regions[region].sort().join(', ')})`);
    });

    console.log('\n🎉 State import complete!');

  } catch (error) {
    console.error('❌ Error importing states:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedStates();
