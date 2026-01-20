'use client';

import { useState } from 'react';
import {
  FileText,
  Building2,
  Clock,
  Plus,
  RefreshCw,
  Settings,
  Database,
  Bot,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';
import agenciesData from '@/../public/data/sample-agencies.json';

// Simulated pending content for review
const pendingContent = [
  {
    id: 'pending-1',
    title: 'New AI Safety Guidelines',
    source: 'https://example.gov.au/ai-safety',
    discoveredAt: '2024-01-20T10:30:00Z',
    status: 'pending_review',
    aiAnalysis: {
      isRelevant: true,
      relevanceScore: 0.92,
      suggestedType: 'guideline',
      suggestedJurisdiction: 'federal',
      summary: 'New guidelines for AI safety in critical infrastructure',
    },
  },
  {
    id: 'pending-2',
    title: 'State AI Investment Program',
    source: 'https://example.vic.gov.au/ai-program',
    discoveredAt: '2024-01-19T14:15:00Z',
    status: 'pending_review',
    aiAnalysis: {
      isRelevant: false,
      relevanceScore: 0.35,
      suggestedType: null,
      suggestedJurisdiction: 'vic',
      summary: 'Funding announcement, not a policy document',
    },
  },
];

// Simulated data sources
const dataSources = [
  {
    id: 'source-1',
    name: 'DTA Website',
    url: 'https://www.dta.gov.au',
    type: 'scraper',
    lastRun: '2024-01-20T08:00:00Z',
    status: 'healthy',
    itemsFound: 156,
  },
  {
    id: 'source-2',
    name: 'DISER News Feed',
    url: 'https://www.industry.gov.au/rss',
    type: 'rss',
    lastRun: '2024-01-20T09:30:00Z',
    status: 'healthy',
    itemsFound: 42,
  },
  {
    id: 'source-3',
    name: 'AG Department',
    url: 'https://www.ag.gov.au',
    type: 'scraper',
    lastRun: '2024-01-19T12:00:00Z',
    status: 'error',
    itemsFound: 0,
  },
];

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage content, review AI suggestions, and configure data sources
          </p>
        </div>
        <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Policy</DialogTitle>
              <DialogDescription>
                Manually add a new AI policy to the database
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Policy title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Jurisdiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(JURISDICTION_NAMES).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POLICY_TYPE_NAMES).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POLICY_STATUS_NAMES).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input id="sourceUrl" placeholder="https://" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPolicyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddPolicyOpen(false)}>Add Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="review">Content Review</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{policiesData.length}</div>
                    <p className="text-sm text-muted-foreground">Total Policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{agenciesData.length}</div>
                    <p className="text-sm text-muted-foreground">Agencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pendingContent.length}</div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{dataSources.length}</div>
                    <p className="text-sm text-muted-foreground">Data Sources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates to the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policiesData.slice(0, 5).map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{policy.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(policy.updatedAt).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{JURISDICTION_NAMES[policy.jurisdiction as keyof typeof JURISDICTION_NAMES]}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI-Suggested Content
              </CardTitle>
              <CardDescription>
                Review content discovered by the AI agent and approve or reject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {pendingContent.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <a
                              href={item.source}
                              className="text-sm text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.source}
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">
                              Discovered {new Date(item.discoveredAt).toLocaleString('en-AU')}
                            </p>
                          </div>
                          <Badge
                            variant={item.aiAnalysis.isRelevant ? 'default' : 'secondary'}
                          >
                            {Math.round(item.aiAnalysis.relevanceScore * 100)}% relevant
                          </Badge>
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Bot className="h-4 w-4" />
                            AI Analysis
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.aiAnalysis.summary}
                          </p>
                          {item.aiAnalysis.suggestedType && (
                            <div className="mt-2 flex gap-2">
                              <Badge variant="outline">
                                Type: {POLICY_TYPE_NAMES[item.aiAnalysis.suggestedType as keyof typeof POLICY_TYPE_NAMES]}
                              </Badge>
                              {item.aiAnalysis.suggestedJurisdiction && (
                                <Badge variant="outline">
                                  {JURISDICTION_NAMES[item.aiAnalysis.suggestedJurisdiction as keyof typeof JURISDICTION_NAMES]}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit & Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingContent.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        No pending content to review
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Data Sources</h2>
              <p className="text-sm text-muted-foreground">
                Configure and monitor content discovery sources
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>

          <div className="grid gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          source.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold">{source.name}</h3>
                        <a
                          href={source.url}
                          className="text-sm text-muted-foreground hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline">{source.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.itemsFound} items found
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    {source.status === 'healthy' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      Last run: {new Date(source.lastRun).toLocaleString('en-AU')}
                    </span>
                    {source.status === 'error' && (
                      <Badge variant="destructive" className="ml-2">
                        Error
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Configure the Claude AI integration for content analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">Anthropic API Key</Label>
                <Input id="apiKey" type="password" placeholder="sk-ant-..." />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and never exposed
                </p>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Select defaultValue="claude-sonnet-4-20250514">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="relevanceThreshold">Relevance Threshold</Label>
                <Input
                  id="relevanceThreshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue="0.7"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum relevance score (0-1) for content to be flagged for review
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Configure Supabase connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input id="supabaseUrl" placeholder="https://xxx.supabase.co" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
                <Input id="supabaseKey" type="password" placeholder="eyJ..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
