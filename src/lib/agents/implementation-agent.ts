import fs from 'fs/promises';
import path from 'path';
import type { ResearchFinding, VerificationResult, Policy } from '@/types';
import { updateFindingStatus } from './pipeline-storage';

const POLICIES_FILE = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');

async function loadPolicies(): Promise<Policy[]> {
  try {
    const data = await fs.readFile(POLICIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePolicies(policies: Policy[]) {
  await fs.writeFile(POLICIES_FILE, JSON.stringify(policies, null, 2), 'utf-8');
}

/**
 * Build a policy entry directly from research finding data.
 * The research agent already extracts all the metadata we need,
 * so no additional AI call is required.
 */
function buildPolicyEntry(
  finding: ResearchFinding,
  verification: VerificationResult
): Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> {
  // Apply any suggested corrections from verification
  const corrections = verification.suggestedCorrections || [];
  const hasTypeCorrection = corrections.some(c => c.toLowerCase().includes('type'));
  const hasJurisdictionCorrection = corrections.some(c => c.toLowerCase().includes('jurisdiction'));

  return {
    title: finding.title,
    description: finding.summary,
    jurisdiction: (!hasJurisdictionCorrection && finding.suggestedJurisdiction) || 'federal',
    type: (!hasTypeCorrection && finding.suggestedType) || 'guideline',
    status: 'active',
    effectiveDate: finding.keyDates[0] || '',
    agencies: finding.agencies,
    sourceUrl: finding.sourceUrl,
    content: finding.sourceContent.slice(0, 5000),
    aiSummary: finding.summary,
    tags: finding.tags,
  };
}

/**
 * Generate a slug-based ID from a title
 */
function generatePolicyId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export interface ImplementationResult {
  findingId: string;
  action: 'created' | 'updated' | 'skipped';
  policyId: string;
  error?: string;
}

export interface ImplementationAgentResult {
  results: ImplementationResult[];
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Run the Implementation Agent - applies verified findings to the policy database.
 * Builds policy entries directly from research data without additional AI calls.
 */
export async function runImplementationAgent(
  findings: ResearchFinding[],
  verifications: VerificationResult[]
): Promise<ImplementationAgentResult> {
  const results: ImplementationResult[] = [];
  const errors: string[] = [];
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const policies = await loadPolicies();
  const verificationMap = new Map(verifications.map(v => [v.findingId, v]));

  // Only implement verified findings
  const verifiedFindings = findings.filter(f => f.status === 'verified');

  for (const finding of verifiedFindings) {
    try {
      const verification = verificationMap.get(finding.id);
      if (!verification || verification.confidenceScore < 0.5) {
        results.push({
          findingId: finding.id,
          action: 'skipped',
          policyId: '',
          error: 'Insufficient verification confidence',
        });
        skippedCount++;
        continue;
      }

      console.log(`[Implementation Agent] Processing: ${finding.title}`);

      // Check if this is an update to an existing policy
      const existingPolicy = policies.find(p =>
        p.title.toLowerCase() === finding.title.toLowerCase() ||
        p.sourceUrl === finding.sourceUrl
      );

      if (existingPolicy && !finding.isNewPolicy) {
        // Update existing policy
        const policyData = buildPolicyEntry(finding, verification);
        const idx = policies.findIndex(p => p.id === existingPolicy.id);

        policies[idx] = {
          ...existingPolicy,
          description: policyData.description,
          aiSummary: policyData.aiSummary,
          tags: [...new Set([...existingPolicy.tags, ...policyData.tags])],
          agencies: [...new Set([...existingPolicy.agencies, ...policyData.agencies])],
          updatedAt: new Date().toISOString(),
        };

        await updateFindingStatus(finding.id, 'implemented');
        results.push({
          findingId: finding.id,
          action: 'updated',
          policyId: existingPolicy.id,
        });
        updatedCount++;
      } else {
        // Create new policy
        const policyData = buildPolicyEntry(finding, verification);
        const policyId = generatePolicyId(policyData.title);

        // Check for duplicate IDs
        if (policies.find(p => p.id === policyId)) {
          results.push({
            findingId: finding.id,
            action: 'skipped',
            policyId,
            error: 'Policy with this ID already exists',
          });
          skippedCount++;
          continue;
        }

        const newPolicy: Policy = {
          ...policyData,
          id: policyId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        policies.push(newPolicy);
        await updateFindingStatus(finding.id, 'implemented');
        results.push({
          findingId: finding.id,
          action: 'created',
          policyId,
        });
        createdCount++;
      }
    } catch (err) {
      const errMsg = `Failed to implement "${finding.title}": ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`[Implementation Agent] ${errMsg}`);
      errors.push(errMsg);
      results.push({
        findingId: finding.id,
        action: 'skipped',
        policyId: '',
        error: errMsg,
      });
      skippedCount++;
    }
  }

  // Save updated policies
  await savePolicies(policies);

  console.log(`[Implementation Agent] Complete. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`);

  return {
    results,
    createdCount,
    updatedCount,
    skippedCount,
    errors,
  };
}
