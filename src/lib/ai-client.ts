import OpenAI from 'openai';

/**
 * Shared AI client configured for OpenRouter.
 * All AI analysis (scraper, research agent, verifier, implementation agent) uses this.
 */
export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export const AI_MODEL = process.env.AI_MODEL || 'openrouter/auto';

/**
 * Helper to extract text from a chat completion response.
 */
export function getResponseText(
  completion: OpenAI.Chat.Completions.ChatCompletion,
): string {
  return completion.choices[0]?.message?.content || '';
}
