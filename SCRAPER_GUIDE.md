# Policai Automatic Scraper System - Complete Guide

## Overview

Policai now features a fully automatic scraper system that discovers, analyzes, and imports Australian AI policy content without manual intervention. The system uses Claude AI to intelligently determine content relevance and automatically creates policy pages from high-quality sources.

## What Was Implemented

### 1. Scraper API Endpoint
**File:** `/src/app/api/admin/run-scraper/route.ts`

This endpoint handles the core scraping logic:
- Fetches content from configured Australian government websites
- Parses HTML to find policy-related links
- Cleans and extracts text content
- Analyzes relevance using Claude AI
- Automatically creates policies or adds to review queue based on confidence scores

**Decision Logic:**
- **Relevance Score ≥ 0.8**: Automatically create policy page
- **Relevance Score 0.5-0.8**: Add to pending review for admin approval
- **Relevance Score < 0.5**: Skip (not relevant enough)

### 2. Scheduled Task Runner
**File:** `/scripts/run-scheduled-scrapers.ts`

A TypeScript script that:
- Manages scraper schedules (daily, weekly, monthly)
- Tracks last run times and status
- Runs scrapers based on their configured intervals
- Implements rate limiting to avoid overwhelming servers or APIs
- Logs detailed execution information
- Maintains state between runs

### 3. Data Sources

Currently monitoring **8 Australian AI policy sources:**

| Source | URL | Schedule |
|--------|-----|----------|
| DTA AI Policy | dta.gov.au | Daily |
| DISER AI Strategy | industry.gov.au | Weekly |
| CSIRO Data61 | csiro.au | Weekly |
| AHRC AI Ethics | humanrights.gov.au | Weekly |
| OAIC AI Guidance | oaic.gov.au | Monthly |
| NSW Digital AI | digital.nsw.gov.au | Weekly |
| Victorian AI Strategy | vic.gov.au | Weekly |
| ACCC Digital Platforms | accc.gov.au | Monthly |

## How to Use

### Option 1: Manual Execution (Testing)

Run scrapers manually anytime from the command line:

```bash
npm run scrape
```

This will:
1. Check which scrapers are due to run based on their schedules
2. Execute all due scrapers sequentially
3. Display detailed progress and results
4. Update the state file with last run times

**Example output:**
```
============================================================
Scheduled Scraper Runner
Started at: 2024-01-21T10:00:00Z
============================================================
[2024-01-21T10:00:00Z] Running scraper: DTA AI Policy (source-1)
  ✓ Success:
    - Items found: 10
    - Items processed: 10
    - Auto-created: 3
    - Pending review: 5
    - Skipped: 2
  Waiting 5 seconds before next scraper...
[2024-01-21T10:00:05Z] Skipping DISER AI Strategy: Not due to run yet
...
============================================================
Summary:
  - Sources run: 2
  - Sources skipped: 6
  - Sources errored: 0
Completed at: 2024-01-21T10:02:34Z
============================================================
```

### Option 2: Admin Dashboard (Manual Trigger)

Visit http://localhost:3002/admin and navigate to the **Data Sources** tab:

1. Each source has a "Run Now" button
2. Click to manually trigger a scraper for that source
3. View results in real-time
4. Check the **Content Review** tab to approve/reject discovered content

### Option 3: Scheduled Automation (Production)

#### Using Cron (Linux/Mac)

Edit your crontab:
```bash
crontab -e
```

Add this line to run scrapers every 6 hours:
```bash
0 */6 * * * cd /home/user/Policai && /usr/bin/npm run scrape >> logs/scraper.log 2>&1
```

Or run daily at 2 AM:
```bash
0 2 * * * cd /home/user/Policai && /usr/bin/npm run scrape >> logs/scraper.log 2>&1
```

#### Using GitHub Actions (Recommended for Cloud)

Create `.github/workflows/scraper.yml`:

```yaml
name: Automated Policy Scraping

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Allow manual trigger from GitHub UI

jobs:
  scrape:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run scrapers
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: npm run scrape

      - name: Upload logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: scraper-logs
          path: logs/
```

Don't forget to add `ANTHROPIC_API_KEY` to your GitHub repository secrets!

## AI Analysis Details

### What Claude Analyzes

For each discovered page, Claude AI evaluates:

1. **Relevance** (0-1 score): How related is this to Australian AI policy?
2. **Policy Type**: legislation, regulation, guideline, framework, standard
3. **Jurisdiction**: federal, NSW, VIC, QLD, WA, SA, TAS, ACT, NT
4. **Key Agencies**: Which government agencies are mentioned?
5. **Important Dates**: Publication dates, effective dates, review dates
6. **Related Topics**: AI ethics, data privacy, algorithmic transparency, etc.
7. **Summary**: 2-3 sentence overview of the content

### Example Analysis Result

```json
{
  "isRelevant": true,
  "relevanceScore": 0.85,
  "summary": "The DTA's updated AI Policy Framework provides comprehensive guidance for Australian government agencies on the responsible use of AI systems, including mandatory transparency requirements and risk assessment procedures.",
  "tags": ["AI governance", "transparency", "risk management"],
  "policyType": "framework",
  "jurisdiction": "federal",
  "agencies": ["Digital Transformation Agency", "Department of Finance"],
  "keyDates": ["2024-07-01"],
  "relatedTopics": ["AI ethics", "algorithmic accountability", "public sector AI"]
}
```

## Monitoring and Maintenance

### Check Scraper Status

The system maintains state in `data/scraper-state.json`:

```json
{
  "source-1": {
    "lastRun": "2024-01-21T10:00:00Z",
    "lastStatus": "success"
  },
  "source-2": {
    "lastRun": "2024-01-20T02:00:00Z",
    "lastStatus": "error",
    "lastError": "Failed to fetch URL: HTTP 503"
  }
}
```

### View Logs

Logs are saved to `logs/scraper.log` (when using cron):

```bash
# View recent logs
tail -100 logs/scraper.log

# Follow logs in real-time
tail -f logs/scraper.log

# Search for errors
grep "Error" logs/scraper.log
```

### Admin Dashboard

The admin dashboard provides oversight:

- **Content Review Tab**: Review and approve/reject scraped content
- **Data Sources Tab**: View source status, last run times, and manual controls
- **Recent Activity**: See newly created policies from automated scraping

## Performance & Costs

### Execution Time

- **Per source**: 2-5 minutes average
- **Full run (8 sources)**: 15-40 minutes
- Rate limiting: 2 seconds between pages, 5 seconds between sources

### API Costs (Claude AI)

- **Per page analyzed**: ~$0.005-0.01 (depending on content size)
- **Per scraper run**: ~$0.05-0.10 (10 pages average)
- **Daily (1 source)**: ~$0.10/day = $3/month
- **Full automation (8 sources)**: ~$15-25/month

### Rate Limits

- Claude API: 50 requests/minute (well within limits with current rate limiting)
- Government websites: Respectful 2-second delays between requests

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"

**Solution:** Add your API key to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Scraper finds 0 items

**Possible causes:**
1. Website structure changed (need to update scraper logic)
2. Network issues or firewall blocking requests
3. Website requires authentication or has bot detection

**Solution:** Check the source URL manually in a browser first.

### Too many pending items, not enough auto-created

**Solution:** Lower the confidence threshold in `/src/app/api/admin/run-scraper/route.ts`:

```typescript
// Change from 0.8 to 0.7 for auto-creation
if (analysis.relevanceScore >= 0.7 && analysis.isRelevant) {
  await createPolicy(link.title, link.url, analysis, content);
}
```

### High API costs

**Solutions:**
1. Reduce scraping frequency (weekly instead of daily)
2. Limit links per source (currently 10)
3. Increase confidence threshold to reduce analysis of irrelevant pages

## Extending the System

### Adding New Data Sources

1. Edit `/src/app/api/admin/run-scraper/route.ts`
2. Add to the `DATA_SOURCES` object:

```typescript
'source-9': {
  name: 'New Government AI Initiative',
  url: 'https://example.gov.au/ai',
},
```

3. Update `/scripts/run-scheduled-scrapers.ts` with schedule:

```typescript
{
  id: 'source-9',
  name: 'New Government AI Initiative',
  schedule: 'weekly',
  enabled: true,
},
```

4. Test manually: `npm run scrape`

### Customizing Scraping Logic

The scraper uses CSS selectors to find links. To customize:

```typescript
// Find all links
$('a').each((_, element) => {
  const href = $(element).attr('href');
  const text = $(element).text().trim();

  // Add custom filtering logic here
  const isLikelyPolicy =
    href.includes('your-custom-pattern') ||
    text.toLowerCase().includes('your-keyword');
});
```

### Adjusting Confidence Thresholds

In `/src/app/api/admin/run-scraper/route.ts`:

```typescript
// Current thresholds
if (analysis.relevanceScore >= 0.8) {
  // Auto-create
} else if (analysis.relevanceScore >= 0.5) {
  // Pending review
} else {
  // Skip
}

// More aggressive auto-creation (risky)
if (analysis.relevanceScore >= 0.6) {
  // Auto-create
}

// More conservative (safer, more manual review)
if (analysis.relevanceScore >= 0.9) {
  // Auto-create
}
```

## Best Practices

1. **Start with manual testing**: Run `npm run scrape` manually first to verify everything works
2. **Monitor for a week**: Check the admin dashboard daily to review auto-created content quality
3. **Adjust thresholds**: Based on quality, raise or lower confidence thresholds
4. **Regular reviews**: Even with automation, periodically review the Content Review tab
5. **Update sources**: Government websites change; update scraper logic as needed
6. **Check logs**: Review scraper logs weekly for errors or issues

## Architecture Overview

```
User (optional)
    ↓
Admin Dashboard (/admin)
    ↓ (manual trigger)
    ↓
┌─────────────────────────────────────────┐
│  Scraper API Endpoint                   │
│  /api/admin/run-scraper                 │
│                                          │
│  1. Fetch source page                   │
│  2. Extract policy links                │
│  3. For each link:                      │
│     a) Fetch content                    │
│     b) Clean HTML                       │
│     c) Analyze with Claude AI ────────> │  Claude API
│     d) Decide action based on score     │      ↓
│                                          │  Analysis Result
│  4. Return summary                      │
└─────────────────────────────────────────┘
         ↓              ↓
    High Score     Medium Score
         ↓              ↓
    Auto-Create    Add to Pending
     Policy            Review
         ↓              ↓
    sample-policies    pending-content
       .json              .json
         ↓                  ↓
    Public Site      Admin Dashboard
                     (manual approval)
```

## Support

For issues or questions:
1. Check the logs: `logs/scraper.log`
2. Review the README: `scripts/README.md`
3. Examine state file: `data/scraper-state.json`
4. Test manually: `npm run scrape`
5. Check admin dashboard: http://localhost:3002/admin

## Summary

You now have a fully automated AI policy tracking system that:
- ✅ Monitors 8 Australian government sources
- ✅ Uses Claude AI to analyze content relevance
- ✅ Automatically creates policy pages (high confidence)
- ✅ Queues medium-confidence content for review
- ✅ Runs on configurable schedules
- ✅ Provides detailed logging and monitoring
- ✅ Can be triggered manually or automatically
- ✅ Integrated with admin dashboard for oversight

The system significantly reduces manual work while maintaining quality through AI analysis and human-in-the-loop review for edge cases.
