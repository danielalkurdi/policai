'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Calendar, Loader2, ArrowRight, ChevronDown, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Timeline } from '@/components/visualizations/Timeline';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
  type Jurisdiction,
  type PolicyType,
  type PolicyStatus,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';
import timelineData from '@/../public/data/sample-timeline.json';

const statusColors: Record<PolicyStatus, string> = {
  proposed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  amended: 'bg-blue-100 text-blue-800 border-blue-200',
  repealed: 'bg-gray-100 text-gray-800 border-gray-200',
  trashed: 'bg-red-100 text-red-800 border-red-200',
};

type TimelineEventType =
  | 'policy_introduced'
  | 'policy_amended'
  | 'policy_repealed'
  | 'announcement'
  | 'milestone';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: TimelineEventType;
  jurisdiction: Jurisdiction;
  relatedPolicyId?: string;
  sourceUrl?: string;
}

function PoliciesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const hasActiveFilters = jurisdictionFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

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
      .filter((policy) => policy.status !== 'trashed')
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

  // Get related policy for timeline event
  const relatedPolicy = selectedEvent?.relatedPolicyId
    ? policiesData.find((p) => p.id === selectedEvent.relatedPolicyId)
    : null;

  const clearFilters = () => {
    setJurisdictionFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Policies</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search Australian AI policies, regulations, and frameworks
        </p>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-1" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {/* Search + Filter Toggle */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={hasActiveFilters ? 'default' : 'outline'}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                    !
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Collapsible Filters */}
            {filtersOpen && (
              <div className="flex gap-2 flex-wrap items-center p-3 bg-muted/50 rounded-lg">
                <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                  <SelectTrigger className="w-[160px]">
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
                  <SelectTrigger className="w-[140px]">
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
                  <SelectTrigger className="w-[130px]">
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

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing {filteredPolicies.length} of {totalPolicies} policies
            </div>
          </div>

          {/* Compact Policy List */}
          <div className="space-y-2">
            {filteredPolicies.map((policy) => (
              <Link key={policy.id} href={`/policies/${policy.id}`}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{policy.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {policy.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[policy.status as PolicyStatus]}`}
                        >
                          {POLICY_STATUS_NAMES[policy.status as PolicyStatus]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {JURISDICTION_NAMES[policy.jurisdiction as Jurisdiction]}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(policy.effectiveDate).toLocaleDateString('en-AU', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
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
                      clearFilters();
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Click on an event to see more details
              </p>
              <Timeline
                events={timelineData as TimelineEvent[]}
                onEventClick={(event) => setSelectedEvent(event as TimelineEvent)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Timeline Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {selectedEvent &&
                new Date(selectedEvent.date).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {selectedEvent && JURISDICTION_NAMES[selectedEvent.jurisdiction]}
              </Badge>
              <Badge variant="outline">
                {selectedEvent?.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>

            <p className="text-muted-foreground">{selectedEvent?.description}</p>

            {relatedPolicy && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-1">Related Policy</h4>
                  <p className="font-medium">{relatedPolicy.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {relatedPolicy.description}
                  </p>
                  <Link
                    href={`/policies/${relatedPolicy.id}`}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View Policy
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {selectedEvent?.sourceUrl && (
              <a
                href={selectedEvent.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View source
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
