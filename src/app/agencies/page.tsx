'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ExternalLink, Building2, FileText, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JURISDICTION_NAMES, type Jurisdiction } from '@/types';

import agenciesData from '@/../public/data/sample-agencies.json';
import policiesData from '@/../public/data/sample-policies.json';

export default function AgenciesPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');

  const filteredAgencies = useMemo(() => {
    return agenciesData.filter((agency) => {
      const matchesSearch =
        search === '' ||
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        agency.acronym.toLowerCase().includes(search.toLowerCase());

      const matchesLevel = levelFilter === 'all' || agency.level === levelFilter;
      const matchesJurisdiction =
        jurisdictionFilter === 'all' || agency.jurisdiction === jurisdictionFilter;

      return matchesSearch && matchesLevel && matchesJurisdiction;
    });
  }, [search, levelFilter, jurisdictionFilter]);

  const federalAgencies = filteredAgencies.filter((a) => a.level === 'federal');
  const stateAgencies = filteredAgencies.filter((a) => a.level === 'state');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agency Directory</h1>
        <p className="mt-2 text-muted-foreground">
          Browse government agencies and their AI transparency statements
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                {Object.entries(JURISDICTION_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAgencies.length} of {agenciesData.length} agencies
        </div>
      </div>

      {/* Agency Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAgencies.length})</TabsTrigger>
          <TabsTrigger value="federal">Federal ({federalAgencies.length})</TabsTrigger>
          <TabsTrigger value="state">State ({stateAgencies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AgencyList agencies={filteredAgencies} />
        </TabsContent>

        <TabsContent value="federal" className="space-y-4">
          <AgencyList agencies={federalAgencies} />
        </TabsContent>

        <TabsContent value="state" className="space-y-4">
          <AgencyList agencies={stateAgencies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgencyList({ agencies }: { agencies: typeof agenciesData }) {
  if (agencies.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No agencies found matching your filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {agencies.map((agency) => {
        const relatedPolicies = policiesData.filter((p) =>
          p.agencies.includes(agency.id)
        );

        return (
          <Card key={agency.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agency.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{agency.acronym}</Badge>
                      <Badge variant="secondary">
                        {JURISDICTION_NAMES[agency.jurisdiction as Jurisdiction]}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {agency.aiTransparencyStatement && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Shield className="h-4 w-4 text-primary" />
                    AI Transparency Statement
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {agency.aiTransparencyStatement}
                  </p>
                </div>
              )}

              {agency.aiUsageDisclosure && (
                <div className="text-sm">
                  <span className="font-medium">AI Usage: </span>
                  <span className="text-muted-foreground">{agency.aiUsageDisclosure}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{relatedPolicies.length} policies</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Website
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/agencies/${agency.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>

              {relatedPolicies.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Related Policies</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedPolicies.slice(0, 3).map((policy) => (
                      <Link
                        key={policy.id}
                        href={`/policies/${policy.id}`}
                        className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                      >
                        {policy.title.length > 40
                          ? policy.title.substring(0, 40) + '...'
                          : policy.title}
                      </Link>
                    ))}
                    {relatedPolicies.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{relatedPolicies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
