import OpenAI from 'openai';

export interface DiscoveredSource {
  url: string;
  title: string;
}

const DISCOVERY_MODEL = 'perplexity/sonar-pro';

const SEARCH_QUERIES = [
  'site:gov.au artificial intelligence policy',
  'site:gov.au AI regulation framework 2025 2026',
  'site:gov.au AI governance guideline',
  'site:gov.au responsible AI',
  'site:gov.au AI ethics framework',
  'Australian government AI strategy announcement',
  'site:gov.au machine learning regulation',
];

const MAX_DISCOVERED_URLS = 20;
const GOV_AU_URL_REGEX = /https?:\/\/[^\s"'<>)*\[\]]+\.gov\.au[^\s"'<>)*\[\]]*/g;

/**
 * Search for .gov.au AI policy pages using Perplexity via OpenRouter.
 * Returns discovered URLs not already in the known set.
 * Gracefully returns empty if OPENROUTER_API_KEY is not set.
 */
export async function runDiscoveryAgent(
  existingUrls: string[],
): Promise<DiscoveredSource[]> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Discovery Agent] OPENROUTER_API_KEY not set, skipping discovery');
    return [];
  }

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const knownUrls = new Set(existingUrls.map(normalizeUrl));
  const allDiscovered = new Map<string, DiscoveredSource>();

  console.log(`[Discovery Agent] Starting search with ${SEARCH_QUERIES.length} queries`);

  for (const query of SEARCH_QUERIES) {
    try {
      console.log(`[Discovery Agent] Searching: "${query}"`);

      const completion = await client.chat.completions.create({
        model: DISCOVERY_MODEL,
        messages: [
          {
            role: 'user',
            content: `Find Australian government (.gov.au) web pages about: ${query}

List each relevant page with its URL and a one-line description. Focus on official policy documents, frameworks, guidelines, strategies, and regulatory announcements related to artificial intelligence.`,
          },
        ],
      });

      const responseText = completion.choices[0]?.message?.content || '';

      // Extract URLs from the prose response
      const rawUrlsFromText = responseText.match(GOV_AU_URL_REGEX) || [];
      const urlsFromText = rawUrlsFromText.map(cleanExtractedUrl).filter(Boolean) as string[];

      // Extract from Perplexity citations if available
      const citations = (completion as unknown as { citations?: string[] }).citations || [];
      const urlsFromCitations = citations
        .filter((c: string) => c.includes('.gov.au'))
        .map(cleanExtractedUrl)
        .filter(Boolean) as string[];

      const allUrls = [...new Set([...urlsFromText, ...urlsFromCitations])];

      for (const url of allUrls) {
        const normalized = normalizeUrl(url);
        if (knownUrls.has(normalized)) continue;
        if (allDiscovered.has(normalized)) continue;

        // Extract a title from the response context around the URL
        const title = extractTitleForUrl(url, responseText) || url;
        allDiscovered.set(normalized, { url: normalized, title });
        knownUrls.add(normalized);
      }

      // Rate limit between search queries
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(
        `[Discovery Agent] Search failed for "${query}":`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const results = Array.from(allDiscovered.values()).slice(0, MAX_DISCOVERED_URLS);

  console.log(
    `[Discovery Agent] Complete. Discovered ${results.length} new URLs (${allDiscovered.size} total before cap)`,
  );

  return results;
}

/**
 * Normalize a URL for deduplication: strip trailing slashes, fragments, and lowercase the host.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    let normalized = parsed.toString();
    // Strip trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url.replace(/\/+$/, '');
  }
}

/**
 * Try to extract a meaningful title for a URL from the surrounding text.
 */
function extractTitleForUrl(url: string, text: string): string | null {
  // Look for markdown-style links: [title](url)
  const markdownMatch = text.match(
    new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegex(url)}[^)]*\\)`),
  );
  if (markdownMatch) return markdownMatch[1].trim();

  // Look for text on the same line before or near the URL
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes(url)) {
      // Strip the URL, markdown, and list markers to get the title
      const cleaned = line
        .replace(/https?:\/\/[^\s)]+/g, '')
        .replace(/[[\]()]/g, '')
        .replace(/^[\s\-*•]+/, '')
        .replace(/[:\-–]+$/, '')
        .trim();
      if (cleaned.length > 5 && cleaned.length < 200) return cleaned;
    }
  }

  return null;
}

/**
 * Clean a URL extracted from Perplexity's markdown-formatted response.
 * Strips trailing markdown artifacts, punctuation, and validates the URL.
 */
function cleanExtractedUrl(url: string): string | null {
  // Strip trailing markdown/punctuation artifacts
  let cleaned = url.replace(/[*#`\[\]().,;:!?]+$/, '');
  // Strip trailing quotes
  cleaned = cleaned.replace(/["']+$/, '');
  // Validate it's still a proper URL
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    return null;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
