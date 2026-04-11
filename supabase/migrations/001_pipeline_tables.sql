-- Pipeline tables for Policai automated data updates
-- These tables persist pipeline runs, research findings, and verification results
-- so they survive Vercel's ephemeral filesystem between deploys.

-- Pipeline runs track each execution of the research/verification/implementation pipeline
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id text PRIMARY KEY,
  "startedAt" timestamptz NOT NULL,
  "completedAt" timestamptz,
  stage text NOT NULL DEFAULT 'research',
  "sourcesScanned" jsonb NOT NULL DEFAULT '[]',
  "findingsCount" integer NOT NULL DEFAULT 0,
  "verifiedCount" integer NOT NULL DEFAULT 0,
  "implementedCount" integer NOT NULL DEFAULT 0,
  "rejectedCount" integer NOT NULL DEFAULT 0,
  "hitlRequired" boolean NOT NULL DEFAULT true,
  "hitlApprovedAt" timestamptz,
  "hitlApprovedBy" text,
  "hitlNotes" text,
  error text
);

-- Research findings discovered by the research agent during a pipeline run
CREATE TABLE IF NOT EXISTS research_findings (
  id text PRIMARY KEY,
  "pipelineRunId" text NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  "sourceUrl" text,
  "sourceContent" text,
  "discoveredAt" timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'discovered',
  "relevanceScore" real NOT NULL DEFAULT 0,
  "suggestedType" text,
  "suggestedJurisdiction" text,
  tags jsonb NOT NULL DEFAULT '[]',
  agencies jsonb NOT NULL DEFAULT '[]',
  "keyDates" jsonb NOT NULL DEFAULT '[]',
  "relatedTopics" jsonb NOT NULL DEFAULT '[]',
  "isNewPolicy" boolean NOT NULL DEFAULT true,
  "existingPolicyId" text,
  "changeDescription" text
);

-- Verification results from the verifier agent cross-referencing findings
CREATE TABLE IF NOT EXISTS verification_results (
  id text PRIMARY KEY,
  "findingId" text NOT NULL REFERENCES research_findings(id) ON DELETE CASCADE,
  "pipelineRunId" text NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  "verifiedAt" timestamptz NOT NULL,
  outcome text NOT NULL,
  "confidenceScore" real NOT NULL DEFAULT 0,
  "sourcesCrossReferenced" jsonb NOT NULL DEFAULT '[]',
  "verificationNotes" text,
  "factualIssues" jsonb NOT NULL DEFAULT '[]',
  "suggestedCorrections" jsonb NOT NULL DEFAULT '[]'
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_research_findings_pipeline_run ON research_findings("pipelineRunId");
CREATE INDEX IF NOT EXISTS idx_research_findings_status ON research_findings(status);
CREATE INDEX IF NOT EXISTS idx_verification_results_pipeline_run ON verification_results("pipelineRunId");
CREATE INDEX IF NOT EXISTS idx_verification_results_finding ON verification_results("findingId");
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started ON pipeline_runs("startedAt" DESC);
