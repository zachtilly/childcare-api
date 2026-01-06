# Data Management Guide

This guide explains how to update your child care policy database with real, verified data from official sources.

## Current Data Status

Run this command to see your current data quality:

```bash
node scripts/validate-data.js
```

This will show you:
- Data completeness percentage
- Quality breakdown (high/medium/low confidence)
- States needing real data
- Metrics with low confidence
- Overall quality score

## Tools Available

### 1. Quick Command-Line Update

**Best for:** Single policy updates when you know exactly what to change

```bash
node scripts/update-policy.js <state> <metric> <value> "<source>" "<url>" "<confidence>"
```

**Examples:**

```bash
# Update California's income eligibility
node scripts/update-policy.js CA income-eligibility-fpl 85 "CA CDSS 2024 CCDF Plan" "https://cdss.ca.gov" "high"

# Update Texas subsidy rate
node scripts/update-policy.js TX subsidy-rate-infant 1050 "TX HHS Rate Sheet 2024" "https://hhs.texas.gov" "high"

# Update New York paid leave
node scripts/update-policy.js NY paid-leave-weeks 12 "NY Paid Family Leave" "https://paidfamilyleave.ny.gov" "high"

# Update Florida inspection requirement
node scripts/update-policy.js FL annual-inspection true "FL Administrative Code 65C-22" "" "high"
```

### 2. Interactive Data Entry Tool

**Best for:** Entering multiple policies with guided prompts and validation

```bash
node scripts/interactive-data-entry.js
```

This tool will:
- Show you all available states and metrics
- Prompt you for values with type checking
- Ask for data source and confidence level
- Confirm before saving
- Allow you to enter multiple policies in one session

**Workflow:**
1. Select state (e.g., "CA")
2. Choose metric from numbered list
3. Enter value (validated by data type)
4. Provide source information
5. Confirm and save
6. Optionally enter another policy

### 3. Data Validation

**Best for:** Checking data quality and identifying what needs updating

```bash
node scripts/validate-data.js
```

**What it reports:**
- Overall completeness (% of expected records)
- Quality breakdown by confidence level
- Generated vs. verified data ratio
- Priority states needing attention
- Specific recommendations

## Data Sources

See `DATA_SOURCES.md` for comprehensive list of official sources.

### Quick Reference:

**Federal Sources:**
- CCDF Plans: https://www.acf.hhs.gov/occ/form/ccdf-plans
- BLS Wage Data: https://www.bls.gov/oes/current/oes399011.htm
- Child Care Aware: https://www.childcareaware.org/

**State Agencies (Pattern):**
- Search: "[State] child care subsidy"
- Look for: Department of Social Services, Human Services, or Children & Families
- Find: CCDF plans, rate sheets, licensing regulations

## Step-by-Step: Updating a State's Data

### Example: Updating California's Policies

1. **Find Official Sources**
   ```
   California Department of Social Services (CDSS)
   https://www.cdss.ca.gov/inforesources/child-care
   ```

2. **Locate Current CCDF Plan**
   - Go to ACF.HHS.gov CCDF plans
   - Download California's latest plan (usually PDF)

3. **Extract Key Data Points**
   - Income eligibility: Look for "eligibility" section
   - Subsidy rates: Find rate schedules
   - Quality standards: Review licensing requirements

4. **Update Each Policy**
   ```bash
   # Use interactive tool
   node scripts/interactive-data-entry.js

   # Or use command line
   node scripts/update-policy.js CA income-eligibility-fpl 85 "CA CCDF Plan 2024-2025" "https://..." "high"
   node scripts/update-policy.js CA subsidy-rate-infant 1800 "CA CCDF Plan 2024-2025" "https://..." "high"
   # ... continue for all metrics
   ```

5. **Verify Updates**
   ```bash
   # Check the dashboard
   curl http://localhost:3000/api/data/state/CA

   # Or view in the web dashboard
   # http://localhost:5173 -> State Profile -> Select California
   ```

6. **Run Validation**
   ```bash
   node scripts/validate-data.js
   ```

## Priority Order for Updates

### Phase 1: High-Population States (Week 1-2)
Focus on states with largest populations for maximum impact:

1. **California** (38.9M) - Use CA CDSS, CCDF plan
2. **Texas** (30.5M) - Use TX HHS, CCDF plan
3. **Florida** (22.6M) - Use FL DCF, CCDF plan
4. **New York** (19.6M) - Use NY OCFS, CCDF plan
5. **Pennsylvania** (13.0M) - Use PA DHS, CCDF plan

### Phase 2: Regional Representatives (Week 3-4)
Cover each region with key states:

- **Northeast:** Massachusetts, New Jersey
- **South:** Georgia, North Carolina, Virginia
- **Midwest:** Illinois, Ohio, Michigan
- **West:** Washington, Colorado, Arizona

### Phase 3: Complete Coverage (Week 5-8)
Fill in remaining states

## Data Quality Standards

### High Confidence
- ✅ Direct from official state agency website
- ✅ Dated within last 12 months
- ✅ Clear source citation with URL
- ✅ Verified with state CCDF plan or regulations

### Medium Confidence
- ⚠️  From reputable national organizations
- ⚠️  Data 1-2 years old
- ⚠️  Compiled from multiple states
- ⚠️  Source cited but not directly verified

### Low Confidence
- ❌ Third-party sources without citations
- ❌ Data older than 2 years
- ❌ Estimated or projected values
- ❌ Unverifiable information

## Available Metrics

| Metric | Description | Typical Source |
|--------|-------------|----------------|
| income-eligibility-fpl | Income limit (% of FPL) | CCDF Plan |
| subsidy-waitlist-size | Families on waitlist | State agency reports |
| subsidy-rate-infant | Monthly subsidy for infants | CCDF rate schedules |
| ratio-infant | Staff-to-child ratio | Licensing regulations |
| annual-inspection | Required annual inspection | Licensing regulations |
| centers-per-1000 | Centers per 1000 children | Child Care Aware data |
| childcare-desert-pct | % in child care deserts | Center for American Progress |
| paid-leave-weeks | Weeks of paid family leave | State labor department |
| tax-credit-amount | State child care tax credit | State tax department |
| avg-worker-wage | Childcare worker annual wage | Bureau of Labor Statistics |
| required-training-hours | Annual training hours | Licensing regulations |

## Tips for Efficient Data Entry

1. **Work in batches** - Update one state completely before moving to the next
2. **Keep sources organized** - Create a spreadsheet tracking which sources you've used
3. **Use the interactive tool** - Faster than command line for multiple entries
4. **Validate frequently** - Run validation after each state to track progress
5. **Document as you go** - Note any issues or questions in a separate file
6. **Set realistic goals** - Aim for 2-3 states per work session

## Troubleshooting

### "State not found"
- Check spelling of state code (must be uppercase, e.g., "CA" not "ca")
- Run `curl http://localhost:3000/api/states` to see all valid codes

### "Metric not found"
- Check metric slug spelling
- Run `curl http://localhost:3000/api/policy/metrics` to see all valid slugs

### "Value format error"
- Ensure value matches data type:
  - Currency: Numbers only (1500, not "$1,500")
  - Boolean: "true"/"false" or "yes"/"no"
  - Numeric: Plain numbers
  - Text: Any string

### Database connection error
- Ensure API server is running (`npm run dev` in childcare-api directory)
- Check .env file has correct Supabase credentials

## Progress Tracking

Create a simple tracking spreadsheet:

| State | Completed | Last Updated | Notes |
|-------|-----------|--------------|-------|
| CA | ✅ | 2024-01-05 | All 11 metrics verified |
| TX | ✅ | 2024-01-05 | All 11 metrics verified |
| NY | 🔄 | 2024-01-05 | 7/11 metrics done |
| ... | | | |

## Getting Help

- **Data source questions:** See DATA_SOURCES.md
- **Tool usage:** Run command with no arguments to see help
- **Data structure:** Check childcare-policy-schema.sql
- **API endpoints:** See childcare-api/README.md

## Next Steps

After updating real data:
1. Update the dashboard visualization with new insights
2. Add time-series data to track policy changes over time
3. Calculate composite scores to rank states
4. Generate reports and analysis
5. Share findings with stakeholders

---

**Remember:** Quality over speed. It's better to have 10 states with verified, high-confidence data than 50 states with questionable data.
