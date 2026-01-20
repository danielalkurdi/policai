'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ExternalLink, Building2, FileText, Shield, CheckCircle2, XCircle, Calendar, Mail } from 'lucide-react';
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

import commonwealthAgenciesData from '@/../public/data/commonwealth-agencies.json';

export default function AgenciesPage() {
  const [search, setSearch] = useState('');
  const [statementFilter, setStatementFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const total = commonwealthAgenciesData.length;
    const withStatements = commonwealthAgenciesData.filter((a) => a.hasPublishedStatement).length;
    const withoutStatements = total - withStatements;
    return { total, withStatements, withoutStatements };
  }, []);

  const filteredAgencies = useMemo(() => {
    return commonwealthAgenciesData.filter((agency) => {
      const matchesSearch =
        search === '' ||
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        agency.acronym.toLowerCase().includes(search.toLowerCase());

      const matchesStatement =
        statementFilter === 'all' ||
        (statementFilter === 'published' && agency.hasPublishedStatement) ||
        (statementFilter === 'not-published' && !agency.hasPublishedStatement);

      return matchesSearch && matchesStatement;
    });
  }, [search, statementFilter]);

  const agenciesWithStatements = filteredAgencies.filter((a) => a.hasPublishedStatement);
  const agenciesWithoutStatements = filteredAgencies.filter((a) => !a.hasPublishedStatement);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Commonwealth Agency AI Transparency Directory</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive list of Australian Commonwealth agencies and their AI transparency statements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agencies</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <Building2 className="h-12 w-12 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Statements</p>
                <p className="text-3xl font-bold text-green-600">{stats.withStatements}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.withStatements / stats.total) * 100)}% compliance
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Statement</p>
                <p className="text-3xl font-bold text-orange-600">{stats.withoutStatements}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.withoutStatements / stats.total) * 100)}% pending
                </p>
              </div>
              <XCircle className="h-12 w-12 text-orange-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agencies by name or acronym..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statementFilter} onValueChange={setStatementFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by statement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="published">Published Statements</SelectItem>
                <SelectItem value="not-published">No Statement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAgencies.length} of {commonwealthAgenciesData.length} Commonwealth agencies
        </div>
      </div>

      {/* Agency Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAgencies.length})</TabsTrigger>
          <TabsTrigger value="published">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Published ({agenciesWithStatements.length})
          </TabsTrigger>
          <TabsTrigger value="not-published">
            <XCircle className="h-4 w-4 mr-1" />
            No Statement ({agenciesWithoutStatements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AgencyList agencies={filteredAgencies} />
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <AgencyList agencies={agenciesWithStatements} />
        </TabsContent>

        <TabsContent value="not-published" className="space-y-4">
          <AgencyList agencies={agenciesWithoutStatements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgencyList({ agencies }: { agencies: typeof commonwealthAgenciesData }) {
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
        return (
          <Card key={agency.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    agency.hasPublishedStatement ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {agency.hasPublishedStatement ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{agency.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{agency.acronym}</Badge>
                      <Badge variant={agency.hasPublishedStatement ? 'default' : 'secondary'}>
                        {agency.hasPublishedStatement ? 'Published' : 'No Statement'}
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

              {agency.auditFindings && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Audit Findings</p>
                      <p className="text-sm text-orange-700 mt-1">{agency.auditFindings}</p>
                    </div>
                  </div>
                </div>
              )}

              {agency.lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Last updated: {new Date(agency.lastUpdated).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}

              {agency.accountableOfficial && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Accountable Official: </span>
                  {agency.accountableOfficial}
                </div>
              )}

              {agency.contactEmail && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <a
                    href={`mailto:${agency.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {agency.contactEmail}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 flex-wrap">
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
                {agency.transparencyStatementUrl && (
                  <Button variant="default" size="sm" asChild>
                    <a
                      href={agency.transparencyStatementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      AI Statement
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
