import type { ResearchFinding, VerificationResult } from '@/types';
import { saveVerifications, updateFindingStatus } from './pipeline-storage';

/**
 * Verify a single research finding using rule-based checks:
 * - Relevance score threshold
 * - Source URL legitimacy (Australian government domains)
 * - Cross-referencing with other findings from different sources
 */
function verifyFinding(
  finding: ResearchFinding,
  allFindings: ResearchFinding[]
): VerificationResult {
  const issues: string[] = [];
  const corrections: string[] = [];
  let confidenceScore = finding.relevanceScore;

  // Check 1: Source URL is from a known Australian government domain
  const govDomains = ['.gov.au', '.csiro.au', '.edu.au'];
  const isGovSource = govDomains.some(d => finding.sourceUrl.includes(d));
  if (!isGovSource) {
    issues.push('Source URL is not from a recognised Australian government domain');
    confidenceScore -= 0.2;
  }

  // Check 2: Cross-reference with other findings from different sources
  const corroborating = allFindings.filter(
    f =>
      f.id !== finding.id &&
      f.sourceUrl !== finding.sourceUrl &&
      (f.title.toLowerCase().includes(finding.title.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
        finding.tags.some(tag => f.tags.includes(tag)))
  );
  if (corroborating.length > 0) {
    confidenceScore += 0.1 * Math.min(corroborating.length, 3);
  }

  // Check 3: Required fields present
  if (!finding.summary || finding.summary.length < 20) {
    issues.push('Summary is too short or missing');
    confidenceScore -= 0.1;
  }
  if (!finding.suggestedType) {
    corrections.push('Missing policy type classification');
    confidenceScore -= 0.05;
  }
  if (!finding.suggestedJurisdiction) {
    corrections.push('Missing jurisdiction classification');
    confidenceScore -= 0.05;
  }

  // Clamp confidence to 0-1
  confidenceScore = Math.max(0, Math.min(1, confidenceScore));

  let outcome: VerificationResult['outcome'];
  if (confidenceScore >= 0.7) {
    outcome = 'confirmed';
  } else if (confidenceScore >= 0.5) {
    outcome = 'partially_confirmed';
  } else if (issues.length > 0) {
    outcome = 'contradicted';
  } else {
    outcome = 'unverifiable';
  }

  const notes = [
    `Relevance score: ${finding.relevanceScore.toFixed(2)}`,
    isGovSource ? 'Source is a recognised government domain' : 'Source is not a government domain',
    corroborating.length > 0
      ? `Cross-referenced with ${corroborating.length} related finding(s) from other sources`
      : 'No corroborating findings from other sources',
    ...issues,
  ].join('. ');

  return {
    id: `verification-${finding.id}`,
    findingId: finding.id,
    pipelineRunId: finding.pipelineRunId,
    verifiedAt: new Date().toISOString(),
    outcome,
    confidenceScore,
    sourcesCrossReferenced: [
      finding.sourceUrl,
      ...corroborating.map(c => c.sourceUrl),
    ],
    verificationNotes: notes,
    factualIssues: issues,
    suggestedCorrections: corrections,
  };
}

export interface VerifierAgentResult {
  verifications: VerificationResult[];
  confirmedCount: number;
  rejectedCount: number;
  errors: string[];
}

/**
 * Run the Verifier Agent - validates research findings using rule-based checks
 * instead of additional AI calls, keeping the pipeline fast and cost-effective.
 */
export async function runVerifierAgent(
  findings: ResearchFinding[]
): Promise<VerifierAgentResult> {
  const verifications: VerificationResult[] = [];
  let confirmedCount = 0;
  let rejectedCount = 0;

  for (const finding of findings) {
    console.log(`[Verifier Agent] Verifying: ${finding.title}`);

    const result = verifyFinding(finding, findings);
    verifications.push(result);

    // Update finding status based on verification
    if (result.outcome === 'confirmed' || result.outcome === 'partially_confirmed') {
      if (result.confidenceScore >= 0.5) {
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
  }

  // Save all verification results
  await saveVerifications(verifications);

  console.log(`[Verifier Agent] Complete. Confirmed: ${confirmedCount}, Rejected: ${rejectedCount}`);

  return {
    verifications,
    confirmedCount,
    rejectedCount,
    errors: [],
  };
}
