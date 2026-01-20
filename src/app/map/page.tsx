'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const displayJurisdiction = hoveredJurisdiction || selectedJurisdiction;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Geographic View</h1>
        <p className="mt-2 text-muted-foreground">
          Explore AI policies by Australian state and territory
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Australia Policy Map</CardTitle>
              <CardDescription>
                Click on a state or territory to see its AI policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AustraliaMap
                data={jurisdictionData}
                selectedJurisdiction={selectedJurisdiction}
                onJurisdictionClick={setSelectedJurisdiction}
                onJurisdictionHover={setHoveredJurisdiction}
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {displayJurisdiction ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {jurisdictionData[displayJurisdiction].count}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Policies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {jurisdictionData[displayJurisdiction].active}
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {agenciesData.filter((a) => a.jurisdiction === displayJurisdiction).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Agencies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {JURISDICTION_NAMES[displayJurisdiction]}
                    </div>
                    <p className="text-sm text-muted-foreground">Jurisdiction</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{policiesData.length}</div>
                    <p className="text-sm text-muted-foreground">Total Policies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {policiesData.filter((p) => p.status === 'active').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{agenciesData.length}</div>
                    <p className="text-sm text-muted-foreground">Agencies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">9</div>
                    <p className="text-sm text-muted-foreground">Jurisdictions</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedJurisdiction
                  ? JURISDICTION_NAMES[selectedJurisdiction]
                  : 'Select a Jurisdiction'}
              </CardTitle>
              <CardDescription>
                {selectedJurisdiction
                  ? `${selectedPolicies.length} policies, ${selectedAgencies.length} agencies`
                  : 'Click on the map to explore policies by region'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedJurisdiction ? (
                <ScrollArea className="h-[500px] pr-4">
                  {/* Policies */}
                  <div className="mb-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4" />
                      Policies ({selectedPolicies.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedPolicies.map((policy) => (
                        <Card key={policy.id} className="p-3">
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={
                                policy.status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : policy.status === 'proposed'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {POLICY_STATUS_NAMES[policy.status as PolicyStatus]}
                            </Badge>
                          </div>
                          <h4 className="font-medium mt-2 text-sm">{policy.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {policy.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {POLICY_TYPE_NAMES[policy.type as PolicyType]}
                            </Badge>
                            <Link
                              href={`/policies/${policy.id}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </Card>
                      ))}
                      {selectedPolicies.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No policies found for this jurisdiction
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Agencies */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4" />
                      Agencies ({selectedAgencies.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedAgencies.map((agency) => (
                        <Card key={agency.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm">{agency.name}</h4>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {agency.acronym}
                              </Badge>
                            </div>
                          </div>
                          {agency.aiTransparencyStatement && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {agency.aiTransparencyStatement}
                            </p>
                          )}
                          <div className="mt-2">
                            <Link
                              href={`/agencies/${agency.id}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              View Profile
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </Card>
                      ))}
                      {selectedAgencies.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No agencies found for this jurisdiction
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Select a state or territory on the map to view its AI policies and agencies
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/policies">Browse All Policies</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
