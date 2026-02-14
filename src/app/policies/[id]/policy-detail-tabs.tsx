'use client';

import Link from 'next/link';
import {
  Calendar,
  Building2,
  ExternalLink,
  FileText,
  Tag,
  Clock,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
  type Policy,
  type Jurisdiction,
  type PolicyType,
  type PolicyStatus,
} from '@/types';

const statusColors: Record<string, string> = {
  proposed: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  amended: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  repealed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400',
};

const typeColors: Record<string, string> = {
  legislation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  regulation: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  guideline: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  framework: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  standard: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

interface PolicyDetailTabsProps {
  policy: Policy;
  relatedPolicies: Policy[];
}

export function PolicyDetailTabs({ policy, relatedPolicies }: PolicyDetailTabsProps) {
  return (
    <div>
      {/* Header - always visible */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={statusColors[policy.status] || 'bg-gray-100 text-gray-800'}
          >
            {POLICY_STATUS_NAMES[policy.status as PolicyStatus] || policy.status}
          </Badge>
          <Badge className={typeColors[policy.type] || 'bg-gray-100 text-gray-800'}>
            {POLICY_TYPE_NAMES[policy.type as PolicyType] || policy.type}
          </Badge>
          <Badge variant="secondary">
            {JURISDICTION_NAMES[policy.jurisdiction as Jurisdiction] || policy.jurisdiction}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{policy.title}</h1>
        <p className="text-muted-foreground mt-2">{policy.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Effective:{' '}
              {new Date(policy.effectiveDate).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Updated:{' '}
              {new Date(policy.updatedAt).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        {policy.sourceUrl && (
          <div className="mt-4">
            <Button asChild size="sm">
              <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Source
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {policy.content && (
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-1" />
              Full Content
            </TabsTrigger>
          )}
          {(relatedPolicies.length > 0 || policy.agencies.length > 0) && (
            <TabsTrigger value="related">Related</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* AI Summary */}
          {policy.aiSummary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {policy.aiSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {policy.tags.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {policy.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Responsible Agencies (compact in overview) */}
          {policy.agencies.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Building2 className="h-4 w-4" />
                Responsible Agencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {policy.agencies.map((agency) => (
                  <Link key={agency} href="/agencies">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
                      {agency.toUpperCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Full Content Tab */}
        {policy.content && (
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {policy.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Related Tab */}
        {(relatedPolicies.length > 0 || policy.agencies.length > 0) && (
          <TabsContent value="related" className="mt-6 space-y-6">
            {/* Related Policies */}
            {relatedPolicies.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Related Policies</h3>
                <div className="space-y-2">
                  {relatedPolicies.map((related) => (
                    <Link
                      key={related.id}
                      href={`/policies/${related.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm">{related.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {related.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {JURISDICTION_NAMES[related.jurisdiction as Jurisdiction]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusColors[related.status]}`}
                            >
                              {POLICY_STATUS_NAMES[related.status as PolicyStatus]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Agencies */}
            {policy.agencies.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Responsible Agencies</h3>
                <div className="space-y-2">
                  {policy.agencies.map((agency) => (
                    <Card key={agency}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agency.toUpperCase()}</p>
                          <Link
                            href="/agencies"
                            className="text-xs text-primary hover:underline"
                          >
                            View agency details
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
