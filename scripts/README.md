# Policai Automatic Scraper System

This directory contains scripts for automatically discovering and importing Australian AI policy content.

## How It Works

The scraper system automatically:

1. **Discovers content** from configured data sources (government websites, policy portals)
2. **Analyzes relevance** using Claude AI to determine if content is related to Australian AI policy
3. **Auto-creates policies** for high-confidence content (relevance score ≥ 0.8)
4. **Queues for review** medium-confidence content (relevance score 0.5-0.8)
5. **Skips** low-confidence content (relevance score < 0.5)

## Data Sources

The system currently monitors 8 Australian AI policy sources:

1. **DTA AI Policy** (daily)
2. **DISER AI Strategy** (weekly)
3. **CSIRO Data61** (weekly)
4. **AHRC AI Ethics** (weekly)
5. **OAIC AI Guidance** (monthly)
6. **NSW Digital AI** (weekly)
7. **Victorian AI Strategy** (weekly)
8. **ACCC Digital Platforms** (monthly)

## Setup

### 1. Install Dependencies

```bash
npm install tsx
```

### 2. Configure Environment

Ensure your `.env.local` file has the Claude AI API key:

```bash
ANTHROPIC_API_KEY=your_key_here
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/*.ts
```

## Usage

### Manual Execution

Run all scrapers that are due:

```bash
npm run scrape
```

Or use tsx directly:

```bash
tsx scripts/run-scheduled-scrapers.ts
```

### Scheduled Execution (Cron)

Add to your crontab (`crontab -e`):

```bash
# Run scrapers every hour
0 * * * * cd /path/to/Policai && /usr/bin/tsx scripts/run-scheduled-scrapers.ts >> logs/scraper.log 2>&1

# Or run daily at 2 AM
0 2 * * * cd /path/to/Policai && /usr/bin/tsx scripts/run-scheduled-scrapers.ts >> logs/scraper.log 2>&1
```

### Using GitHub Actions (Recommended)

Create `.github/workflows/scraper.yml`:

```yaml
name: Run Scrapers

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run scrapers
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: tsx scripts/run-scheduled-scrapers.ts
```

## Monitoring

### Check Scraper State

The script maintains state in `data/scraper-state.json`:

```json
{
  "source-1": {
    "lastRun": "2024-01-20T10:00:00Z",
    "lastStatus": "success"
  },
  "source-2": {
    "lastRun": "2024-01-19T10:00:00Z",
    "lastStatus": "error",
    "lastError": "HTTP 404"
  }
}
```

### View Logs

If using cron, logs are saved to `logs/scraper.log`:

```bash
tail -f logs/scraper.log
```

### Admin Dashboard

View and manage scraped content at:
- `/admin` - Main admin dashboard
- **Content Review** tab - Review pending content discovered by scrapers
- **Data Sources** tab - Manual scraper controls and status

## API Endpoint

The scrapers use the `/api/admin/run-scraper` endpoint:

```bash
curl -X POST http://localhost:3002/api/admin/run-scraper \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "source-1"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "sourceId": "source-1",
    "sourceName": "DTA AI Policy",
    "itemsFound": 10,
    "itemsProcessed": 10,
    "itemsCreated": 3,
    "itemsPending": 5,
    "itemsSkipped": 2
  }
}
```

## AI Analysis

Each scraped page is analyzed by Claude AI with the following criteria:

- **Relevance to Australian AI policy** (0-1 score)
- **Policy type** (legislation, regulation, guideline, framework, standard)
- **Jurisdiction** (federal, state/territory)
- **Key agencies** mentioned
- **Important dates**
- **Related topics** (AI ethics, data privacy, etc.)

### Decision Logic

- **Score ≥ 0.8** → Auto-create policy page
- **Score 0.5-0.8** → Add to pending review queue for admin approval
- **Score < 0.5** → Skip (not relevant enough)

## Troubleshooting

### Scraper fails with "ANTHROPIC_API_KEY not configured"

Ensure the environment variable is set in your shell or `.env.local`:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

### Scraper fails to fetch URLs

Check firewall/network settings. The scraper needs outbound HTTPS access to:
- www.dta.gov.au
- www.industry.gov.au
- www.csiro.au
- humanrights.gov.au
- www.oaic.gov.au
- www.digital.nsw.gov.au
- www.vic.gov.au
- www.accc.gov.au

### Too many API calls to Claude

Adjust rate limiting in `run-scheduled-scrapers.ts` (default: 2 seconds between pages, 5 seconds between sources).

### Want to add a new data source

Edit `/src/app/api/admin/run-scraper/route.ts` and add to the `DATA_SOURCES` mapping, then update the script configuration.

## Development

### Test a Single Source

Modify the script to run only one source:

```typescript
const DATA_SOURCES = [
  {
    id: 'source-1',
    name: 'DTA AI Policy',
    schedule: 'daily',
    enabled: true,
  },
];
```

### Adjust Confidence Thresholds

Edit `/src/app/api/admin/run-scraper/route.ts`:

```typescript
if (analysis.relevanceScore >= 0.9 && analysis.isRelevant) {
  // Higher threshold for auto-creation
  await createPolicy(/*...*/);
}
```

## Performance

- Each scraper processes up to 10 links per source
- Rate limiting: 2 seconds between pages, 5 seconds between sources
- Typical run time: 3-5 minutes per source
- Claude API cost: ~$0.05-0.10 per scraper run

## Contributing

To add support for more data sources:

1. Add the source to `DATA_SOURCES` in `run-scraper/route.ts`
2. Update the schedule in `run-scheduled-scrapers.ts`
3. Test with manual execution first
4. Monitor the admin dashboard for quality
