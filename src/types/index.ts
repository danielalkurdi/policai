// Core domain types for Policai

export type Jurisdiction =
  | 'federal'
  | 'nsw'
  | 'vic'
  | 'qld'
  | 'wa'
  | 'sa'
  | 'tas'
  | 'act'
  | 'nt';

export type PolicyType =
  | 'legislation'
  | 'regulation'
  | 'guideline'
  | 'framework'
  | 'standard';

export type PolicyStatus =
  | 'proposed'
  | 'active'
  | 'amended'
  | 'repealed';

export type AgencyLevel = 'federal' | 'state';

export interface Policy {
  id: string;
  title: string;
  description: string;
  jurisdiction: Jurisdiction;
  type: PolicyType;
  status: PolicyStatus;
  effectiveDate: Date | string;
  agencies: string[];
  sourceUrl: string;
  content: string;
  aiSummary: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Agency {
  id: string;
  name: string;
  acronym: string;
  level: AgencyLevel;
  jurisdiction: Jurisdiction;
  aiTransparencyStatement?: string;
  aiUsageDisclosure?: string;
  website: string;
  policies: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedDate: Date | string;
  relevanceScore: number;
  relatedPolicies: string[];
  tags: string[];
}

export interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description: string;
  type: 'policy_introduced' | 'policy_amended' | 'policy_repealed' | 'announcement' | 'milestone';
  jurisdiction: Jurisdiction;
  relatedPolicyId?: string;
  sourceUrl?: string;
}

// Map visualization types
export interface JurisdictionStats {
  jurisdiction: Jurisdiction;
  policyCount: number;
  activePolicies: number;
  recentUpdates: number;
  agencies: number;
}

// Network/Graph visualization types
export interface PolicyNode {
  id: string;
  label: string;
  type: 'policy' | 'agency' | 'jurisdiction';
  data: Policy | Agency | { jurisdiction: Jurisdiction };
}

export interface PolicyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'governs' | 'related_to' | 'supersedes' | 'amends' | 'located_in';
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter types for UI
export interface PolicyFilters {
  jurisdiction?: Jurisdiction[];
  type?: PolicyType[];
  status?: PolicyStatus[];
  search?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  tags?: string[];
}

// Display name mappings
export const JURISDICTION_NAMES: Record<Jurisdiction, string> = {
  federal: 'Federal',
  nsw: 'New South Wales',
  vic: 'Victoria',
  qld: 'Queensland',
  wa: 'Western Australia',
  sa: 'South Australia',
  tas: 'Tasmania',
  act: 'Australian Capital Territory',
  nt: 'Northern Territory',
};

export const POLICY_TYPE_NAMES: Record<PolicyType, string> = {
  legislation: 'Legislation',
  regulation: 'Regulation',
  guideline: 'Guideline',
  framework: 'Framework',
  standard: 'Standard',
};

export const POLICY_STATUS_NAMES: Record<PolicyStatus, string> = {
  proposed: 'Proposed',
  active: 'Active',
  amended: 'Amended',
  repealed: 'Repealed',
};
