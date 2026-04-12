import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip HTML tags, scripts, and styles from raw HTML content,
 * returning cleaned plain text.
 */
export function cleanHtmlContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract and parse the first JSON object from a text response
 * (e.g. from a Claude AI response that may contain surrounding prose).
 */
export function extractJsonFromResponse<T>(text: string, fallback: T): T {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {
    console.error('Failed to parse JSON from response');
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Deduplication utilities
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'of', 'for', 'in', 'and', 'a', 'an', 'to', 'on', 'by', 'with',
  'its', 'is', 'are', 'was', 'that', 'this', 'from', 'or', 'as', 'at',
  'be', 'it', 'has', 'have', 'not', 'but', 'all', 'their', 'new', 'use',
]);

/**
 * Extract meaningful words from a title, removing stop words,
 * punctuation, and normalizing to lowercase.
 */
function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w)),
  );
}

/**
 * Calculate similarity between two titles using keyword overlap (Jaccard index).
 * Returns a value between 0 (no overlap) and 1 (identical keywords).
 */
export function titleSimilarity(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Normalize a URL for dedup comparison: lowercase host, strip trailing slash,
 * fragment, and common tracking params.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    // Strip common tracking params
    for (const param of ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid']) {
      parsed.searchParams.delete(param);
    }
    let normalized = parsed.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url.replace(/\/+$/, '');
  }
}

/**
 * Check if a title is a fuzzy match to any in a list.
 * Returns the matching title if similarity >= threshold, null otherwise.
 */
export function findSimilarTitle(
  title: string,
  existing: string[],
  threshold = 0.6,
): string | null {
  for (const candidate of existing) {
    if (titleSimilarity(title, candidate) >= threshold) {
      return candidate;
    }
  }
  return null;
}
