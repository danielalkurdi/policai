'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AustraliaMap } from '@/components/visualizations/AustraliaMap';
import {
  JURISDICTION_NAMES,
  POLICY_STATUS_NAMES,
  POLICY_TYPE_NAMES,
  type Jurisdiction,
  type PolicyStatus,
  type PolicyType,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';
import agenciesData from '@/../public/data/sample-agencies.json';

const JURISDICTIONS: Jurisdiction[] = [
  'federal', 'nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt',
];

export default function MapPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);
  const [hoveredJurisdiction, setHoveredJurisdiction] = useState<Jurisdiction | null>(null);

  // Calculate policy counts per jurisdiction
  const jurisdictionData = useMemo(() => {
    const data: Record<Jurisdiction, { count: number; active: number }> = {
      federal: { count: 0, active: 0 },
      nsw: { count: 0, active: 0 },
      vic: { count: 0, active: 0 },
      qld: { count: 0, active: 0 },
      wa: { count: 0, active: 0 },
      sa: { count: 0, active: 0 },
      tas: { count: 0, active: 0 },
      act: { count: 0, active: 0 },
      nt: { count: 0, active: 0 },
    };

    policiesData.forEach((policy) => {
      const j = policy.jurisdiction as Jurisdiction;
      if (data[j]) {
        data[j].count++;
        if (policy.status === 'active') {
          data[j].active++;
        }
      }
    });

    return data;
  }, []);

  // Get policies for selected jurisdiction
  const selectedPolicies = useMemo(() => {
    if (!selectedJurisdiction) return [];
    return policiesData.filter((p) => p.jurisdiction === selectedJurisdiction);
  }, [selectedJurisdiction]);

  // Get agencies for selected jurisdiction
  const selectedAgencies = useMemo(() => {
    if (!selectedJurisdiction) return [];
    return agenciesData.filter((a) => a.jurisdiction === selectedJurisdiction);
  }, [selectedJurisdiction]);

  // Get status text color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'proposed':
        return 'text-amber-600 dark:text-amber-400';
      case 'amended':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="font-mono uppercase text-xs tracking-wider text-muted-foreground mb-3">
            Jurisdictions
          </p>
          <div className="space-y-0.5">
            {JURISDICTIONS.map((j) => (
              <button
                key={j}
                onClick={() =>
                  setSelectedJurisdiction(selectedJurisdiction === j ? null : j)
                }
                className={`w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors hover:bg-muted ${
                  selectedJurisdiction === j
                    ? 'font-bold border-l-2 border-primary pl-2.5'
                    : ''
                }`}
              >
                {JURISDICTION_NAMES[j]}
              </button>
            ))}
          </div>

          {/* Selected jurisdiction policies */}
          {selectedJurisdiction && selectedPolicies.length > 0 && (
            <>
              <div className="border-t my-4" />
              <p className="font-mono uppercase text-xs tracking-wider text-muted-foreground mb-3">
                Policies
              </p>
              <div className="space-y-2">
                {selectedPolicies.map((policy) => (
                  <Link
                    key={policy.id}
                    href={`/policies/${policy.id}`}
                    className="block px-3 py-2 text-sm hover:bg-muted rounded-sm transition-colors"
                  >
                    <p className="font-medium leading-tight">{policy.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getStatusColor(policy.status)}`}>
                        {POLICY_STATUS_NAMES[policy.status as PolicyStatus]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {POLICY_TYPE_NAMES[policy.type as PolicyType]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {selectedJurisdiction && selectedPolicies.length === 0 && (
            <>
              <div className="border-t my-4" />
              <p className="text-sm text-muted-foreground px-3">
                No policies found
              </p>
            </>
          )}
        </div>

        {/* Summary stats at bottom */}
        <div className="border-t p-4">
          <p className="font-mono text-xs text-muted-foreground">
            {selectedJurisdiction
              ? `${selectedPolicies.length} policies \u00b7 ${selectedAgencies.length} agencies`
              : `${policiesData.length} policies \u00b7 ${agenciesData.length} agencies`}
          </p>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-8">
          <AustraliaMap
            data={jurisdictionData}
            selectedJurisdiction={selectedJurisdiction}
            onJurisdictionClick={setSelectedJurisdiction}
            onJurisdictionHover={setHoveredJurisdiction}
          />
        </div>
        {!selectedJurisdiction && (
          <div className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none">
            <p className="font-mono text-sm text-muted-foreground">
              Select a state or territory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
