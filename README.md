# Child Care Policy API

REST API for querying and managing child care policy data across US states.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` and replace with your actual Supabase credentials:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health & Info

- `GET /` - API information and available endpoints
- `GET /health` - Health check

### States

- `GET /api/states` - Get all states
- `GET /api/states/id/:id` - Get state by ID
- `GET /api/states/code/:code` - Get state by code (e.g., CA, TX)
- `GET /api/states/code/:code/context` - Get state with childcare context

### Policy Framework

- `GET /api/policy/categories` - Get all policy categories
- `GET /api/policy/categories/:slug` - Get category with its metrics
- `GET /api/policy/metrics` - Get all metrics
- `GET /api/policy/metrics/:slug` - Get metric details

### Policy Data

- `GET /api/data/state/:stateCode` - Get all current policies for a state
- `GET /api/data/metric/:metricSlug/comparison` - Compare a metric across all states
- `GET /api/data/state/:stateCode/metric/:metricSlug` - Get current value for specific state and metric
- `GET /api/data/state/:stateCode/metric/:metricSlug/timeline` - Get policy timeline
- `GET /api/data/category/:categorySlug` - Get all current policies in a category
- `GET /api/data/compare?stateCodes=CA,TX&metricSlugs=income-eligibility-fpl` - Compare multiple states

## Example Requests

### Get all states
```bash
curl http://localhost:3000/api/states
```

### Get California's policy data
```bash
curl http://localhost:3000/api/data/state/CA
```

### Compare income eligibility across states
```bash
curl http://localhost:3000/api/data/metric/income-eligibility-fpl/comparison
```

### Compare CA and TX on multiple metrics
```bash
curl "http://localhost:3000/api/data/compare?stateCodes=CA,TX&metricSlugs=income-eligibility-fpl,subsidy-rate-infant"
```

### Get policy timeline for California's income eligibility
```bash
curl http://localhost:3000/api/data/state/CA/metric/income-eligibility-fpl/timeline
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Project Structure

```
childcare-api/
├── src/
│   ├── config/
│   │   └── database.js       # Supabase client configuration
│   ├── controllers/
│   │   ├── statesController.js
│   │   ├── policyController.js
│   │   └── policyDataController.js
│   ├── routes/
│   │   ├── states.js
│   │   ├── policy.js
│   │   └── policyData.js
│   └── server.js             # Main entry point
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

This API connects to a Supabase PostgreSQL database with the following main tables:

- `states` - US states with demographic data
- `policy_categories` - High-level policy categories
- `policy_metrics` - Specific measurable policy metrics
- `policy_data` - Time-series policy values by state
- `state_childcare_context` - Additional childcare landscape data
- `composite_scores` - Calculated composite scores
- `composite_score_values` - Score values by state

## Development

The API uses:
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database and API
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-reload

## License

ISC
