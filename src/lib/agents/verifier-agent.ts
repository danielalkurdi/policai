import Anthropic from '@anthropic-ai/sdk';
import type { ResearchFinding, VerificationResult } from '@/types';
import { saveVerifications, updateFindingStatus } from './pipeline-storage';
import { extractJsonFromResponse } from '@/lib/utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Verify a single research finding by cross-referencing its content and claims
 */
async function verifyFinding(
  finding: ResearchFinding,
  allFindings: ResearchFinding[]
): Promise<VerificationResult> {
  // Find corroborating findings from other sources
  const corroborating = allFindings.filter(
    f => f.id !== finding.id &&
    (f.title.toLowerCase().includes(finding.title.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
     finding.tags.some(tag => f.tags.includes(tag)))
  );

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a verification agent for an Australian AI Policy Tracker. Your job is to verify the accuracy and reliability of research findings about Australian AI policy.

FINDING TO VERIFY:
Title: ${finding.title}
Summary: ${finding.summary}
Source URL: ${finding.sourceUrl}
Relevance Score: ${finding.relevanceScore}
Suggested Type: ${finding.suggestedType}
Suggested Jurisdiction: ${finding.suggestedJurisdiction}
Tags: ${finding.tags.join(', ')}
Agencies: ${finding.agencies.join(', ')}
Key Dates: ${finding.keyDates.join(', ')}
Is New Policy: ${finding.isNewPolicy}
${finding.changeDescription ? `Change Description: ${finding.changeDescription}` : ''}

SOURCE CONTENT EXCERPT:
${finding.sourceContent.slice(0, 3000)}

${corroborating.length > 0 ? `
CORROBORATING FINDINGS FROM OTHER SOURCES:
${corroborating.map(c => `- "${c.title}" from ${c.sourceUrl} (score: ${c.relevanceScore})`).join('\n')}
` : 'No corroborating findings from other sources.'}

Please verify this finding. Check for:
1. Does the source content actually support the claimed finding?
2. Are the extracted metadata (type, jurisdiction, agencies) accurate?
3. Are there any factual issues or inconsistencies?
4. Is this a legitimate Australian government AI policy source?
5. If corroborating sources exist, do they agree?

Respond in JSON format:
{
  "outcome": "confirmed|partially_confirmed|unverifiable|contradicted",
  "confidenceScore": 0.0-1.0,
  "verificationNotes": "explanation of verification outcome",
  "factualIssues": ["any factual problems found"],
  "suggestedCorrections": ["corrections if any"],
  "sourcesCrossReferenced": ["list of source URLs checked"]
}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  const parsed = extractJsonFromResponse(text, {
    outcome: 'unverifiable' as VerificationResult['outcome'],
    confidenceScore: 0,
    verificationNotes: 'Failed to verify',
    factualIssues: [] as string[],
    suggestedCorrections: [] as string[],
    sourcesCrossReferenced: [finding.sourceUrl],
  });

  return {
    id: `verification-${finding.id}`,
    findingId: finding.id,
    pipelineRunId: finding.pipelineRunId,
    verifiedAt: new Date().toISOString(),
    outcome: parsed.outcome,
    confidenceScore: parsed.confidenceScore,
    sourcesCrossReferenced: parsed.sourcesCrossReferenced || [finding.sourceUrl],
    verificationNotes: parsed.verificationNotes,
    factualIssues: parsed.factualIssues || [],
    suggestedCorrections: parsed.suggestedCorrections || [],
  };
}

export interface VerifierAgentResult {
  verifications: VerificationResult[];
  confirmedCount: number;
  rejectedCount: number;
  errors: string[];
}

/**
 * Run the Verifier Agent - verifies all research findings from a pipeline run
 */
export async function runVerifierAgent(
  findings: ResearchFinding[]
): Promise<VerifierAgentResult> {
  const verifications: VerificationResult[] = [];
  const errors: string[] = [];
  let confirmedCount = 0;
  let rejectedCount = 0;

  for (const finding of findings) {
    try {
      console.log(`[Verifier Agent] Verifying: ${finding.title}`);

      const result = await verifyFinding(finding, findings);
      verifications.push(result);

      // Update finding status based on verification
      if (result.outcome === 'confirmed' || result.outcome === 'partially_confirmed') {
        if (result.confidenceScore >= 0.6) {
          await updateFindingStatus(finding.id, 'verified');
          confirmedCount++;
        } else {
          await updateFindingStatus(finding.id, 'rejected');
          rejectedCount++;
        }
      } else if (result.outcome === 'contradicted') {
        await updateFindingStatus(finding.id, 'rejected');
        rejectedCount++;
      }
      // 'unverifiable' stays as 'discovered' for HITL review

      // Rate limit: 1s between verifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      const errMsg = `Failed to verify "${finding.title}": ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`[Verifier Agent] ${errMsg}`);
      errors.push(errMsg);
    }
  }

  // Save all verification results
  await saveVerifications(verifications);

  console.log(`[Verifier Agent] Complete. Confirmed: ${confirmedCount}, Rejected: ${rejectedCount}`);

  return {
    verifications,
    confirmedCount,
    rejectedCount,
    errors,
  };
}
