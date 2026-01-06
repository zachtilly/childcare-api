# Official Data Sources for Child Care Policy Data

This document lists reliable sources for updating policy data with real, verified information.

## National Data Sources

### 1. Child Care and Development Fund (CCDF) Plans
- **Source:** U.S. Department of Health and Human Services, Administration for Children and Families
- **URL:** https://www.acf.hhs.gov/occ/form/ccdf-plans
- **Data Available:** Income eligibility, subsidy rates, quality standards, provider requirements
- **Update Frequency:** Annual
- **Notes:** Each state submits a CCDF plan detailing their child care assistance policies

### 2. National Database of Child Care Licensing Regulations
- **Source:** National Center on Early Childhood Quality Assurance (ECQA)
- **URL:** https://childcareta.acf.hhs.gov/licensing
- **Data Available:** Staff-to-child ratios, education requirements, inspection requirements
- **Update Frequency:** Ongoing

### 3. Child Care Aware of America - State Fact Sheets
- **Source:** Child Care Aware of America
- **URL:** https://www.childcareaware.org/resources/
- **Data Available:** Costs of care, child care deserts, workforce data
- **Update Frequency:** Annual

### 4. Center for American Progress - Child Care Deserts
- **Source:** Center for American Progress
- **URL:** https://www.americanprogress.org/issues/early-childhood/reports/
- **Data Available:** Child care desert percentages, supply data
- **Update Frequency:** Periodic

### 5. Bureau of Labor Statistics - Occupational Employment
- **Source:** U.S. Bureau of Labor Statistics
- **URL:** https://www.bls.gov/oes/current/oes399011.htm
- **Data Available:** Childcare worker wages by state
- **Update Frequency:** Annual (May data released in March/April)

### 6. National Partnership for Women & Families - Paid Leave
- **Source:** National Partnership for Women & Families
- **URL:** https://www.nationalpartnership.org/our-work/economic-justice/paid-leave/
- **Data Available:** State paid family leave programs
- **Update Frequency:** Ongoing

## State-Specific Resources

### By Policy Category:

#### Income Eligibility & Subsidies
Each state has a child care subsidy program administered by different agencies:

**Example States:**
- **California:** CA Department of Social Services - https://www.cdss.ca.gov/inforesources/child-care
- **Texas:** TX Health and Human Services - https://www.hhs.texas.gov/services/financial/child-care-services
- **New York:** NY Office of Children and Family Services - https://ocfs.ny.gov/programs/childcare/
- **Florida:** FL Department of Children and Families - https://www.myflfamilies.com/service-programs/child-care/

**General Pattern:** Search for "[State] child care subsidy" or "[State] child care assistance"

#### Quality Standards & Licensing
Most states have dedicated licensing divisions:

**General Pattern:**
- Search for "[State] child care licensing"
- Look for state-specific administrative codes or regulations
- Check department of health or human services websites

#### Paid Family Leave
States with paid family leave programs:
- **California:** https://edd.ca.gov/disability/paid-family-leave/
- **New York:** https://paidfamilyleave.ny.gov/
- **Washington:** https://paidleave.wa.gov/
- **Massachusetts:** https://www.mass.gov/paid-family-and-medical-leave
- **New Jersey:** https://myleavebenefits.nj.gov/
- **Rhode Island, Connecticut, Oregon, Colorado, Delaware, Maryland:** Check state labor department websites

#### Tax Credits
Check each state's department of revenue or taxation website:
- Search for "[State] child care tax credit" or "[State] dependent care credit"

## Data Quality Guidelines

### Confidence Levels

**High Confidence:**
- Data directly from official state agency websites
- Recent (within last 2 years)
- Clear documentation and source citation available

**Medium Confidence:**
- Data from reputable national organizations (Child Care Aware, CLASP, etc.)
- Compiled from multiple states
- May be 2-3 years old

**Low Confidence:**
- Data from third-party sources without clear citations
- Older than 3 years
- Estimated or projected values

### Best Practices

1. **Always cite your source:** Include the specific agency and URL
2. **Date your data:** Note the effective date of the policy
3. **Verify current status:** Policies change - check if the data is still current
4. **Cross-reference:** When possible, verify data with multiple sources
5. **Document assumptions:** If you make calculations or conversions, note them

## How to Update Data

### Method 1: Quick Command Line Update
```bash
node scripts/update-policy.js <state> <metric> <value> "<source>" "<url>" "<confidence>"
```

Example:
```bash
node scripts/update-policy.js CA income-eligibility-fpl 85 "CA CDSS 2024 Plan" "https://..." "high"
```

### Method 2: Interactive Tool
```bash
node scripts/interactive-data-entry.js
```
Follow the prompts to enter data with validation.

### Method 3: Bulk Update Script
Create a CSV or JSON file with multiple updates and use the bulk update script (if needed, can be created).

## Priority States for Real Data

Start with these high-population states to have the most impact:

1. **California** (38.9M) - Progressive policies, high costs
2. **Texas** (30.5M) - Conservative approach, large geographic area
3. **Florida** (22.6M) - Growing population, mixed policies
4. **New York** (19.6M) - Strong worker protections
5. **Pennsylvania** (13.0M) - Rust Belt representative
6. **Illinois** (12.5M) - Midwest major metro
7. **Ohio** (11.8M) - Midwest swing state
8. **Georgia** (11.0M) - Southern growth state

## Contact Information

For questions about data sources or to report issues:
- Create an issue in the project repository
- Check state agency websites for contact information
- National organizations often have policy experts available

## Updates to This Document

This document should be updated as:
- New data sources are discovered
- State websites or structures change
- New federal reporting requirements are established

Last Updated: January 2026
