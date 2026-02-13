'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, ExternalLink, Calendar, Building2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
  type Jurisdiction,
  type PolicyType,
  type PolicyStatus,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';

const statusColors: Record<PolicyStatus, string> = {
  proposed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  amended: 'bg-blue-100 text-blue-800 border-blue-200',
  repealed: 'bg-gray-100 text-gray-800 border-gray-200',
  trashed: 'bg-red-100 text-red-800 border-red-200',
};

const typeColors: Record<PolicyType, string> = {
  legislation: 'bg-purple-100 text-purple-800',
  regulation: 'bg-red-100 text-red-800',
  guideline: 'bg-orange-100 text-orange-800',
  framework: 'bg-teal-100 text-teal-800',
  standard: 'bg-indigo-100 text-indigo-800',
};

function PoliciesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Update search when URL param changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // Update URL when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      const newUrl = params.toString() ? `?${params.toString()}` : '/policies';
      router.replace(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  const filteredPolicies = useMemo(() => {
    return policiesData
      .filter((policy) => policy.status !== 'trashed') // Exclude trashed policies
      .filter((policy) => {
        const matchesSearch =
          search === '' ||
          policy.title.toLowerCase().includes(search.toLowerCase()) ||
          policy.description.toLowerCase().includes(search.toLowerCase()) ||
          policy.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

        const matchesJurisdiction =
          jurisdictionFilter === 'all' || policy.jurisdiction === jurisdictionFilter;
        const matchesType = typeFilter === 'all' || policy.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;

        return matchesSearch && matchesJurisdiction && matchesType && matchesStatus;
      });
  }, [search, jurisdictionFilter, typeFilter, statusFilter]);

  const totalPolicies = policiesData.filter((p) => p.status !== 'trashed').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Policies</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search Australian AI policies, regulations, and frameworks
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[calc(50%-4px)] sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(POLICY_TYPE_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[calc(50%-4px)] sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(POLICY_STATUS_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredPolicies.length} of {totalPolicies} policies
        </div>
      </div>

      {/* Policy List */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={statusColors[policy.status as PolicyStatus]}
                    >
                      {POLICY_STATUS_NAMES[policy.status as PolicyStatus]}
                    </Badge>
                    <Badge className={typeColors[policy.type as PolicyType]}>
                      {POLICY_TYPE_NAMES[policy.type as PolicyType]}
                    </Badge>
                    <Badge variant="secondary">
                      {JURISDICTION_NAMES[policy.jurisdiction as Jurisdiction]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  <CardDescription className="mt-2">{policy.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Effective:{' '}
                    {new Date(policy.effectiveDate).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{policy.agencies.length} agencies</span>
                </div>
                {policy.sourceUrl && (
                  <a
                    href={policy.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Source</span>
                  </a>
                )}
              </div>

              {policy.aiSummary && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                  <p className="text-sm text-muted-foreground">{policy.aiSummary}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {policy.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/policies/${policy.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPolicies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No policies found matching your filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('');
                  setJurisdictionFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PoliciesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Policies</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search Australian AI policies, regulations, and frameworks
        </p>
      </div>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<PoliciesLoading />}>
      <PoliciesContent />
    </Suspense>
  );
}
