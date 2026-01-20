# Quick Start: Automatic AI Policy Scraper

Get the Policai automatic scraper running in 5 minutes.

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ Anthropic API key ([get one here](https://console.anthropic.com/))
- ✅ Policai project set up and running

## Setup (One-Time)

### 1. Add Your API Key

Create or edit `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 2. Verify Installation

Check that everything is installed:

```bash
npm install
```

That's it! The scraper is ready to use.

## Usage

### Test It Now (Manual Run)

Run all due scrapers:

```bash
npm run scrape
```

Expected output:
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
...
============================================================
Summary:
  - Sources run: 1
  - Sources skipped: 7
  - Sources errored: 0
Completed at: 2024-01-21T10:02:34Z
============================================================
```

### Check Results

**Option 1: View auto-created policies**

```bash
# Check the policies file
cat public/data/sample-policies.json | grep -A5 '"title"'
```

**Option 2: Open admin dashboard**

```bash
npm run dev
```

Then visit: http://localhost:3002/admin

- **Content Review** tab: Review pending items that need approval
- **Data Sources** tab: See scraper status and manually trigger runs

## Automate It (Production)

### Option A: Cron Job (Linux/Mac)

Edit crontab:
```bash
crontab -e
```

Add this line (runs every 6 hours):
```bash
0 */6 * * * cd /home/user/Policai && /usr/bin/npm run scrape >> logs/scraper.log 2>&1
```

### Option B: GitHub Actions (Cloud)

1. Rename the example workflow:
   ```bash
   mv .github/workflows/scraper.yml.example .github/workflows/scraper.yml
   ```

2. Add your API key to GitHub:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: your API key

3. Push to GitHub:
   ```bash
   git add .github/workflows/scraper.yml
   git commit -m "Enable automated scraping"
   git push
   ```

4. Done! It will run every 6 hours automatically.

## What Happens Automatically?

1. **Scraper visits 8 Australian government AI policy sources**
   - DTA, DISER, CSIRO, AHRC, OAIC, NSW, VIC, ACCC

2. **Claude AI analyzes each page** (0-1 relevance score)

3. **Smart decisions:**
   - **Score ≥ 0.8**: Auto-create policy page ✅
   - **Score 0.5-0.8**: Add to pending review 📋
   - **Score < 0.5**: Skip ⏭️

4. **Results saved automatically:**
   - New policies: `public/data/sample-policies.json`
   - Pending items: `public/data/pending-content.json`
   - State tracking: `data/scraper-state.json`
   - Logs: `logs/scraper.log`

## Monitoring

### Check scraper state:

```bash
cat data/scraper-state.json
```

### View logs:

```bash
tail -f logs/scraper.log
```

### Admin dashboard:

http://localhost:3002/admin

## Customization

### Change scraping frequency

Edit `/scripts/run-scheduled-scrapers.ts`:

```typescript
const DATA_SOURCES = [
  {
    id: 'source-1',
    name: 'DTA AI Policy',
    schedule: 'daily',    // Change to 'weekly' or 'monthly'
    enabled: true,        // Set to false to disable
  },
  // ...
];
```

### Adjust confidence thresholds

Edit `/src/app/api/admin/run-scraper/route.ts`:

```typescript
// More aggressive (auto-create more policies)
if (analysis.relevanceScore >= 0.7 && analysis.isRelevant) {
  await createPolicy(/*...*/);
}

// More conservative (more manual review)
if (analysis.relevanceScore >= 0.9 && analysis.isRelevant) {
  await createPolicy(/*...*/);
}
```

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"

Add your API key to `.env.local` file in the project root.

### Scraper finds 0 items

- Check if the website is accessible: open URLs in browser
- Websites may have changed structure (update scraper logic)

### Want to test a single source

Edit the script to run only one:

```typescript
const DATA_SOURCES = [
  {
    id: 'source-1',
    name: 'DTA AI Policy',
    schedule: 'daily',
    enabled: true,
  },
  // Comment out others for testing
];
```

## Cost Estimation

- **Per page analyzed**: ~$0.005-0.01
- **Per scraper run** (10 pages): ~$0.05-0.10
- **Daily** (1 source): ~$3/month
- **Full automation** (8 sources, varying schedules): ~$15-25/month

## Next Steps

1. ✅ **Test manual run**: `npm run scrape`
2. ✅ **Review results**: Check `/admin` dashboard
3. ✅ **Adjust thresholds**: If needed based on quality
4. ✅ **Set up automation**: Choose cron or GitHub Actions
5. ✅ **Monitor weekly**: Check logs and review pending items

## Need More Details?

- **Complete guide**: `SCRAPER_GUIDE.md`
- **Scripts documentation**: `scripts/README.md`
- **API endpoint code**: `src/app/api/admin/run-scraper/route.ts`

---

**You're all set!** The scraper will now automatically discover and import Australian AI policies. 🚀
