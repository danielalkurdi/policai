import fs from 'fs/promises';
import path from 'path';
import type {
  PipelineRun,
  ResearchFinding,
  VerificationResult,
} from '@/types';
import { readJsonFile, writeJsonFile } from '@/lib/file-store';

const PIPELINE_DIR = path.join(process.cwd(), 'data', 'pipeline');
const RUNS_FILE = path.join(PIPELINE_DIR, 'pipeline-runs.json');
const FINDINGS_FILE = path.join(PIPELINE_DIR, 'research-findings.json');
const VERIFICATIONS_FILE = path.join(PIPELINE_DIR, 'verification-results.json');

async function ensureDir() {
  await fs.mkdir(PIPELINE_DIR, { recursive: true });
}

async function writeJsonWithDir(filePath: string, data: unknown) {
  await ensureDir();
  await writeJsonFile(filePath, data);
}

// Pipeline Runs

export async function getPipelineRuns(): Promise<PipelineRun[]> {
  return readJsonFile<PipelineRun[]>(RUNS_FILE, []);
}

export async function getPipelineRun(id: string): Promise<PipelineRun | null> {
  const runs = await getPipelineRuns();
  return runs.find(r => r.id === id) ?? null;
}

export async function getLatestPipelineRun(): Promise<PipelineRun | null> {
  const runs = await getPipelineRuns();
  if (runs.length === 0) return null;
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
}

export async function savePipelineRun(run: PipelineRun) {
  const runs = await getPipelineRuns();
  const idx = runs.findIndex(r => r.id === run.id);
  if (idx >= 0) {
    runs[idx] = run;
  } else {
    runs.push(run);
  }
  await writeJsonWithDir(RUNS_FILE, runs);
}

// Research Findings

export async function getFindings(pipelineRunId?: string): Promise<ResearchFinding[]> {
  const findings = await readJsonFile<ResearchFinding[]>(FINDINGS_FILE, []);
  if (pipelineRunId) {
    return findings.filter(f => f.pipelineRunId === pipelineRunId);
  }
  return findings;
}

export async function getFinding(id: string): Promise<ResearchFinding | null> {
  const findings = await readJsonFile<ResearchFinding[]>(FINDINGS_FILE, []);
  return findings.find(f => f.id === id) ?? null;
}

export async function saveFindings(newFindings: ResearchFinding[]) {
  const existing = await readJsonFile<ResearchFinding[]>(FINDINGS_FILE, []);
  for (const finding of newFindings) {
    const idx = existing.findIndex(f => f.id === finding.id);
    if (idx >= 0) {
      existing[idx] = finding;
    } else {
      existing.push(finding);
    }
  }
  await writeJsonWithDir(FINDINGS_FILE, existing);
}

export async function updateFindingStatus(id: string, status: ResearchFinding['status']) {
  const findings = await readJsonFile<ResearchFinding[]>(FINDINGS_FILE, []);
  const idx = findings.findIndex(f => f.id === id);
  if (idx >= 0) {
    findings[idx].status = status;
    await writeJsonWithDir(FINDINGS_FILE, findings);
  }
}

// Verification Results

export async function getVerifications(pipelineRunId?: string): Promise<VerificationResult[]> {
  const results = await readJsonFile<VerificationResult[]>(VERIFICATIONS_FILE, []);
  if (pipelineRunId) {
    return results.filter(v => v.pipelineRunId === pipelineRunId);
  }
  return results;
}

export async function saveVerifications(newResults: VerificationResult[]) {
  const existing = await readJsonFile<VerificationResult[]>(VERIFICATIONS_FILE, []);
  for (const result of newResults) {
    const idx = existing.findIndex(v => v.id === result.id);
    if (idx >= 0) {
      existing[idx] = result;
    } else {
      existing.push(result);
    }
  }
  await writeJsonWithDir(VERIFICATIONS_FILE, existing);
}
