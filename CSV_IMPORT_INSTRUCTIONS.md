# CSV Bulk Import Instructions

## CSV Template Format

The CSV file has these columns:

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| state_code | 2-letter state code | CA, TX, NY | Yes |
| metric_slug | Metric identifier | income-eligibility-fpl | Yes |
| value | The policy value | 85, 1500, true, 1:4 | Yes |
| data_source | Where you found it | CA CDSS CCDF Plan 2024 | Yes |
| source_url | Link to source | https://... | No |
| confidence_level | high, medium, or low | high | Yes |
| notes | Additional context | Section 3.1 of plan | No |

## Valid State Codes

All 50 US states: AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY

## Valid Metric Slugs

| Slug | Data Type | Value Format |
|------|-----------|--------------|
| income-eligibility-fpl | numeric | 85, 150, 200 |
| subsidy-waitlist-size | numeric | 50000, 12000 |
| subsidy-rate-infant | currency | 1800, 950 (USD, no $ or commas) |
| ratio-infant | text | 1:4, 1:3, 1:5 |
| annual-inspection | boolean | true, false |
| centers-per-1000 | numeric | 8.5, 6.2 |
| childcare-desert-pct | numeric | 28, 45 |
| paid-leave-weeks | numeric | 12, 8, 0 |
| tax-credit-amount | currency | 3000, 0 |
| avg-worker-wage | currency | 38500, 28500 |
| required-training-hours | numeric | 24, 20 |

## Value Format Rules

### Numeric
- Plain numbers: `85`, `150`, `200`
- Decimals OK: `8.5`, `6.2`
- No commas: ❌ `50,000` → ✅ `50000`

### Currency
- Numbers only: `1800`, `950`, `38500`
- No dollar signs: ❌ `$1,800` → ✅ `1800`
- No commas: ❌ `38,500` → ✅ `38500`

### Boolean
- Use: `true` or `false`
- Also accepted: `yes`/`no`, `1`/`0`

### Text
- For ratios: `1:4`, `1:3`, `1:5`
- Use quotes if contains commas: `"text, with, commas"`

## How to Fill Out the CSV

### Method 1: Excel/Google Sheets

1. Open `BULK_IMPORT_TEMPLATE.csv` in Excel or Google Sheets
2. Delete the example rows (keep the header!)
3. Add your data, one row per policy
4. Save as CSV

**Tips for Excel:**
- Use text format for state_code column to prevent issues
- Don't use cell formatting (bold, colors) - won't import
- Save as "CSV (Comma delimited) (*.csv)"

### Method 2: Text Editor

1. Open template in text editor (VS Code, Notepad++)
2. Copy the example rows and modify
3. Make sure each line ends with a line break
4. Save with UTF-8 encoding

### Method 3: Programmatic

Generate CSV from a script or database query.

## Example: Complete State Entry

```csv
state_code,metric_slug,value,data_source,source_url,confidence_level,notes
PA,income-eligibility-fpl,185,PA DHS CCDF Plan 2024-2026,https://www.dhs.pa.gov,high,Section 3.2.1
PA,subsidy-waitlist-size,15000,PA DHS Annual Report 2024,https://www.dhs.pa.gov,medium,Estimated from report
PA,subsidy-rate-infant,1100,PA DHS CCW Rate Schedule,https://www.dhs.pa.gov,high,Philadelphia region
PA,ratio-infant,1:4,55 PA Code Chapter 3270,https://www.pacode.com,high,Section 3270.52
PA,annual-inspection,true,PA DHS Licensing Regulations,https://www.dhs.pa.gov,high,Required for licensed centers
PA,centers-per-1000,6.8,Child Care Aware 2024,https://childcareaware.org,medium,PA fact sheet
PA,childcare-desert-pct,35,Center for American Progress,https://americanprogress.org,medium,2023 analysis
PA,paid-leave-weeks,0,PA Labor Laws,https://www.dli.pa.gov,high,No state program
PA,tax-credit-amount,0,PA DOR,https://www.revenue.pa.gov,high,No state credit
PA,avg-worker-wage,32500,Bureau of Labor Statistics,https://www.bls.gov,high,2023 annual mean
PA,required-training-hours,24,PA DHS Regulations,https://www.dhs.pa.gov,high,Annual requirement
```

## Confidence Levels

**high** - Use when:
- Direct from official state agency
- Recent (within 12 months)
- Clear documentation
- Verified from primary source

**medium** - Use when:
- From reputable organization (Child Care Aware, etc.)
- 1-2 years old
- Compiled data
- Secondary source

**low** - Use when:
- Estimated or projected
- Older than 2 years
- Uncertain source
- Needs verification

## Common Mistakes to Avoid

❌ **Dollar signs in currency values**
```csv
CA,subsidy-rate-infant,$1800,... # WRONG
CA,subsidy-rate-infant,1800,...  # CORRECT
```

❌ **Commas in numbers**
```csv
CA,subsidy-waitlist-size,"50,000",... # WRONG
CA,subsidy-waitlist-size,50000,...    # CORRECT
```

❌ **Wrong boolean format**
```csv
CA,annual-inspection,True,... # WRONG (capital T)
CA,annual-inspection,true,... # CORRECT
```

❌ **Invalid state code**
```csv
California,income-eligibility-fpl,85,... # WRONG
CA,income-eligibility-fpl,85,...         # CORRECT
```

❌ **Missing required fields**
```csv
CA,income-eligibility-fpl,85 # WRONG (missing source, confidence)
CA,income-eligibility-fpl,85,CA CDSS,,high, # CORRECT
```

## Partial Updates

You don't need to include all 11 metrics for every state. The import script will:
- Update existing records if they exist
- Create new records if they don't
- Leave other metrics unchanged

So you can import just the data you've researched.

## Import Process

Once your CSV is ready:

```bash
cd childcare-api
node scripts/import-from-csv.js BULK_IMPORT_TEMPLATE.csv
```

The script will:
1. Validate all rows
2. Show you a preview
3. Ask for confirmation
4. Import the data
5. Report success/failures

## Verification

After import:

1. **Run validation:**
   ```bash
   node scripts/validate-data.js
   ```

2. **Check specific state:**
   ```bash
   curl http://localhost:3000/api/data/state/PA
   ```

3. **View in dashboard:**
   Open http://localhost:5173, go to State Profile tab

## Tips for Efficient Data Entry

1. **Work state-by-state** - Complete one state fully before moving to next
2. **Use research guide** - Follow STATE_RESEARCH_GUIDE.md for URLs
3. **Save frequently** - Don't lose your work!
4. **Copy-paste carefully** - Watch for formatting issues
5. **Validate before import** - Check your CSV has no errors
6. **Import in batches** - Do 3-5 states, import, verify, repeat

## Sample Workflow

1. Research California using STATE_RESEARCH_GUIDE.md
2. Fill in 11 rows in CSV (one per metric)
3. Save CSV
4. Run import script
5. Verify in dashboard
6. Move to next state (Texas)
7. Add 11 more rows to same CSV
8. Import again (script updates/adds as needed)
9. Continue...

## Getting Help

If import fails:
- Check error message for specific row/column
- Verify state codes are valid uppercase 2-letter codes
- Verify metric slugs match exactly (case-sensitive)
- Check value formats match data type
- Ensure CSV has proper UTF-8 encoding

Common fixes:
- Remove extra spaces around values
- Use plain quotes (") not smart quotes ("")
- Ensure no missing commas between columns
- Check for extra commas in data values
