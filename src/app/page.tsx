'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { FilterSidebar } from '@/components/filter-sidebar';
import { PolicyTable } from '@/components/policy-table';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const hasActiveFilters = jurisdictionFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setJurisdictionFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const filteredPolicies = useMemo(() => {
    return policiesData
      .filter((p) => p.status !== 'trashed')
      .filter((p) => {
        const matchesSearch =
          search === '' ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
        const matchesJurisdiction = jurisdictionFilter === 'all' || p.jurisdiction === jurisdictionFilter;
        const matchesType = typeFilter === 'all' || p.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesJurisdiction && matchesType && matchesStatus;
      });
  }, [search, jurisdictionFilter, typeFilter, statusFilter]);

  const allPolicies = policiesData.filter((p) => p.status !== 'trashed');
  const jurisdictions = new Set(allPolicies.map((p) => p.jurisdiction));

  const filters = [
    {
      id: 'jurisdiction',
      label: 'Jurisdiction',
      value: jurisdictionFilter,
      onChange: setJurisdictionFilter,
      options: [
        { value: 'all', label: 'All jurisdictions' },
        ...Object.entries(JURISDICTION_NAMES).map(([k, v]) => ({ value: k, label: v })),
      ],
    },
    {
      id: 'type',
      label: 'Type',
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: 'all', label: 'All types' },
        ...Object.entries(POLICY_TYPE_NAMES).map(([k, v]) => ({ value: k, label: v })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All statuses' },
        ...Object.entries(POLICY_STATUS_NAMES)
          .filter(([k]) => k !== 'trashed')
          .map(([k, v]) => ({ value: k, label: v })),
      ],
    },
  ];

  const summary = [
    { label: 'policies', value: filteredPolicies.length },
    { label: 'jurisdictions', value: jurisdictions.size },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          filters={filters}
          summary={summary}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex-1 min-w-0 pt-1">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-2 text-sm bg-transparent border-b border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground"
            />
          </div>

          {/* Count */}
          <div className="font-mono text-xs text-muted-foreground mb-3">
            Showing {filteredPolicies.length} of {allPolicies.length} policies
          </div>

          {/* Table */}
          <PolicyTable policies={filteredPolicies} />
        </div>
      </div>
    </div>
  );
}
