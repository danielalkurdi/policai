'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Building2,
  MapPin,
  BarChart3,
  CheckCircle2,
  Landmark,
  X,
} from 'lucide-react';
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

  const clearSelection = () => {
    setSelectedJurisdiction(null);
  };

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'proposed':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'amended':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Geographic View</h1>
        </div>
        <p className="text-muted-foreground">
          Explore AI policies by Australian state and territory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {displayJurisdiction ? (
          <>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {jurisdictionData[displayJurisdiction].count}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {jurisdictionData[displayJurisdiction].active}
                    </div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {agenciesData.filter((a) => a.jurisdiction === displayJurisdiction).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Agencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <Landmark className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold leading-tight">
                      {JURISDICTION_NAMES[displayJurisdiction]}
                    </div>
                    <p className="text-xs text-muted-foreground">Jurisdiction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{policiesData.length}</div>
                    <p className="text-xs text-muted-foreground">Total Policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {policiesData.filter((p) => p.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{agenciesData.length}</div>
                    <p className="text-xs text-muted-foreground">Agencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">9</div>
                    <p className="text-xs text-muted-foreground">Jurisdictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Australia Policy Map</CardTitle>
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
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedJurisdiction
                      ? JURISDICTION_NAMES[selectedJurisdiction]
                      : 'Select a Jurisdiction'}
                  </CardTitle>
                  <CardDescription>
                    {selectedJurisdiction
                      ? `${selectedPolicies.length} policies, ${selectedAgencies.length} agencies`
                      : 'Click on the map to explore policies by region'}
                  </CardDescription>
                </div>
                {selectedJurisdiction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear selection</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedJurisdiction ? (
                <ScrollArea className="h-[550px] pr-4">
                  {/* Policies */}
                  <div className="mb-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                      <div className="p-1.5 rounded-md bg-blue-500/10">
                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Policies ({selectedPolicies.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedPolicies.map((policy) => (
                        <Card
                          key={policy.id}
                          className="p-3 hover:bg-muted/50 transition-colors border-l-2"
                          style={{
                            borderLeftColor:
                              policy.status === 'active'
                                ? '#22c55e'
                                : policy.status === 'proposed'
                                  ? '#f59e0b'
                                  : '#6b7280',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className={getStatusBadgeClass(policy.status)}>
                              {POLICY_STATUS_NAMES[policy.status as PolicyStatus]}
                            </Badge>
                          </div>
                          <h4 className="font-medium mt-2 text-sm">{policy.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {policy.description}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {POLICY_TYPE_NAMES[policy.type as PolicyType]}
                            </Badge>
                            <Link
                              href={`/policies/${policy.id}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </Card>
                      ))}
                      {selectedPolicies.length === 0 && (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            No policies found for this jurisdiction
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agencies */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                      <div className="p-1.5 rounded-md bg-amber-500/10">
                        <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      Agencies ({selectedAgencies.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedAgencies.map((agency) => (
                        <Card
                          key={agency.id}
                          className="p-3 hover:bg-muted/50 transition-colors border-l-2 border-l-amber-500"
                        >
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
                          <div className="mt-3">
                            <Link
                              href={`/agencies/${agency.id}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              View Profile
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </Card>
                      ))}
                      {selectedAgencies.length === 0 && (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            No agencies found for this jurisdiction
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                    <MapPin className="h-10 w-10 text-indigo-500/50" />
                  </div>
                  <h3 className="font-medium mb-2">No Jurisdiction Selected</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select a state or territory on the map to view its AI policies and agencies
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/policies">
                      <FileText className="h-4 w-4 mr-2" />
                      Browse All Policies
                    </Link>
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
