'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Link as LinkIcon,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Types for pending content
interface PendingItem {
  id: string;
  title: string;
  source: string;
  discoveredAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
  aiAnalysis: {
    isRelevant: boolean;
    relevanceScore: number;
    suggestedType: string | null;
    suggestedJurisdiction: string | null;
    summary: string;
    tags?: string[];
    agencies?: string[];
  };
}

// Types for form data
interface PolicyFormData {
  title: string;
  description: string;
  jurisdiction: string;
  type: string;
  status: string;
  effectiveDate: string;
  sourceUrl: string;
  content: string;
  tags: string;
}

const initialFormData: PolicyFormData = {
  title: '',
  description: '',
  jurisdiction: '',
  type: '',
  status: '',
  effectiveDate: '',
  sourceUrl: '',
  content: '',
  tags: '',
};

// Data sources with automatic scraping
const dataSources = [
  {
    id: 'source-1',
    name: 'DTA AI Policy',
    url: 'https://www.dta.gov.au/our-projects/artificial-intelligence',
    type: 'scraper',
    schedule: 'daily',
    lastRun: '2024-01-20T08:00:00Z',
    status: 'healthy',
    itemsFound: 156,
    enabled: true,
  },
  {
    id: 'source-2',
    name: 'DISER AI Ethics Framework',
    url: 'https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-20T09:30:00Z',
    status: 'healthy',
    itemsFound: 42,
    enabled: true,
  },
  {
    id: 'source-3',
    name: 'CSIRO Data61 AI',
    url: 'https://www.csiro.au/en/work-with-us/services/data61',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-19T15:00:00Z',
    status: 'healthy',
    itemsFound: 23,
    enabled: true,
  },
  {
    id: 'source-4',
    name: 'Australian Human Rights Commission',
    url: 'https://humanrights.gov.au/',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-18T10:00:00Z',
    status: 'healthy',
    itemsFound: 18,
    enabled: true,
  },
  {
    id: 'source-5',
    name: 'OAIC Privacy & AI',
    url: 'https://www.oaic.gov.au/',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-20T14:00:00Z',
    status: 'healthy',
    itemsFound: 31,
    enabled: true,
  },
  {
    id: 'source-6',
    name: 'NSW Digital AI Strategy',
    url: 'https://www.digital.nsw.gov.au/',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-19T11:00:00Z',
    status: 'healthy',
    itemsFound: 12,
    enabled: true,
  },
  {
    id: 'source-7',
    name: 'Victorian AI Strategy',
    url: 'https://www.vic.gov.au/artificial-intelligence',
    type: 'scraper',
    schedule: 'weekly',
    lastRun: '2024-01-18T16:00:00Z',
    status: 'healthy',
    itemsFound: 15,
    enabled: false,
  },
  {
    id: 'source-8',
    name: 'ACCC Digital Platforms',
    url: 'https://www.accc.gov.au/focus-areas/digital-platforms-and-services',
    type: 'scraper',
    schedule: 'monthly',
    lastRun: '2024-01-15T09:00:00Z',
    status: 'healthy',
    itemsFound: 27,
    enabled: true,
  },
];

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isAnalyseUrlOpen, setIsAnalyseUrlOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<PendingItem[]>([]);
  const [policiesCount, setPoliciesCount] = useState(0);
  const [agenciesCount, setAgenciesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlToAnalyse, setUrlToAnalyse] = useState('');
  const [formData, setFormData] = useState<PolicyFormData>(initialFormData);
  const [recentPolicies, setRecentPolicies] = useState<Array<{id: string; title: string; jurisdiction: string; updatedAt: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterRelevance, setFilterRelevance] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [trashedPolicies, setTrashedPolicies] = useState<Array<{id: string; title: string; jurisdiction: string; trashedAt: string}>>([]);
  const [sources, setSources] = useState(dataSources);
  const [isRunningSource, setIsRunningSource] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch pending content
  const fetchPendingContent = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/pending?status=pending_review');
      const data = await response.json();
      if (data.success) {
        setPendingContent(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending content:', error);
    }
  }, []);

  // Fetch counts and recent policies
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingRes, policiesRes, trashedRes] = await Promise.all([
        fetch('/api/admin/pending?status=pending_review'),
        fetch('/api/policies'),
        fetch('/api/policies?status=trashed'),
      ]);

      const [pendingData, policiesData, trashedData] = await Promise.all([
        pendingRes.json(),
        policiesRes.json(),
        trashedRes.json(),
      ]);

      if (pendingData.success) {
        setPendingContent(pendingData.data);
      }

      if (policiesData.success) {
        setPoliciesCount(policiesData.total);
        setRecentPolicies(policiesData.data.slice(0, 5));
      }

      if (trashedData.success) {
        setTrashedPolicies(trashedData.data || []);
      }

      // Load agencies count from sample data
      const agenciesRes = await fetch('/data/sample-agencies.json');
      const agenciesData = await agenciesRes.json();
      setAgenciesCount(agenciesData.length);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Analyse URL
  const handleAnalyseUrl = async () => {
    if (!urlToAnalyse.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to analyse',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalysing(true);
    try {
      // Analyse the URL
      const analyseResponse = await fetch('/api/admin/analyse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToAnalyse }),
      });

      const analyseData = await analyseResponse.json();

      if (!analyseData.success) {
        throw new Error(analyseData.error || 'Failed to analyse URL');
      }

      // Add to pending content
      const addResponse = await fetch('/api/admin/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToAnalyse,
          title: analyseData.data.title,
          analysis: analyseData.data.analysis,
        }),
      });

      const addData = await addResponse.json();

      if (!addData.success) {
        throw new Error(addData.error || 'Failed to add to pending');
      }

      toast({
        title: 'URL Analysed',
        description: `${analyseData.data.title} has been added to pending content for review.`,
      });

      setUrlToAnalyse('');
      setIsAnalyseUrlOpen(false);
      fetchPendingContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyse URL',
        variant: 'destructive',
      });
    } finally {
      setIsAnalysing(false);
    }
  };

  // Approve pending content
  const handleApprove = async (item: PendingItem) => {
    try {
      // Update status to approved
      const updateResponse = await fetch('/api/admin/pending', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: 'approved' }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update status');
      }

      // Add as a policy
      const policyResponse = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.aiAnalysis.summary,
          jurisdiction: item.aiAnalysis.suggestedJurisdiction || 'federal',
          type: item.aiAnalysis.suggestedType || 'guideline',
          status: 'active',
          sourceUrl: item.source,
          tags: item.aiAnalysis.tags || [],
          agencies: item.aiAnalysis.agencies || [],
        }),
      });

      const policyData = await policyResponse.json();

      if (!policyData.success) {
        throw new Error(policyData.error || 'Failed to add policy');
      }

      toast({
        title: 'Content Approved',
        description: `"${item.title}" has been added to the policy database.`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve content',
        variant: 'destructive',
      });
    }
  };

  // Reject pending content
  const handleReject = async (item: PendingItem) => {
    try {
      const response = await fetch('/api/admin/pending', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: 'rejected' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject content');
      }

      toast({
        title: 'Content Rejected',
        description: `"${item.title}" has been rejected and removed from the queue.`,
      });

      fetchPendingContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject content',
        variant: 'destructive',
      });
    }
  };

  // Delete pending content
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/pending?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      toast({
        title: 'Content Deleted',
        description: 'The pending content has been removed.',
      });

      fetchPendingContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  // Add policy manually
  const handleAddPolicy = async () => {
    if (!formData.title || !formData.jurisdiction || !formData.type || !formData.status) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add policy');
      }

      toast({
        title: 'Policy Added',
        description: `"${formData.title}" has been added to the database.`,
      });

      setFormData(initialFormData);
      setIsAddPolicyOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add policy',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-fill form from pending content (Edit & Approve)
  const handleEditAndApprove = (item: PendingItem) => {
    setFormData({
      title: item.title,
      description: item.aiAnalysis.summary,
      jurisdiction: item.aiAnalysis.suggestedJurisdiction || '',
      type: item.aiAnalysis.suggestedType || '',
      status: 'active',
      effectiveDate: '',
      sourceUrl: item.source,
      content: '',
      tags: item.aiAnalysis.tags?.join(', ') || '',
    });
    setIsAddPolicyOpen(true);
  };

  // Batch approve selected items
  const handleBatchApprove = async () => {
    const selectedArray = Array.from(selectedItems);
    if (selectedArray.length === 0) return;

    try {
      await Promise.all(
        selectedArray.map(id => {
          const item = pendingContent.find(i => i.id === id);
          return item ? handleApprove(item) : Promise.resolve();
        })
      );
      setSelectedItems(new Set());
      toast({
        title: 'Batch Approved',
        description: `${selectedArray.length} items have been approved.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve some items',
        variant: 'destructive',
      });
    }
  };

  // Batch reject selected items
  const handleBatchReject = async () => {
    const selectedArray = Array.from(selectedItems);
    if (selectedArray.length === 0) return;

    try {
      await Promise.all(
        selectedArray.map(id => {
          const item = pendingContent.find(i => i.id === id);
          return item ? handleReject(item) : Promise.resolve();
        })
      );
      setSelectedItems(new Set());
      toast({
        title: 'Batch Rejected',
        description: `${selectedArray.length} items have been rejected.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject some items',
        variant: 'destructive',
      });
    }
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
    }
  };

  // Filter content based on search and relevance
  const filteredContent = pendingContent.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aiAnalysis.summary.toLowerCase().includes(searchQuery.toLowerCase());

    // Relevance filter
    const score = item.aiAnalysis.relevanceScore;
    const matchesRelevance =
      filterRelevance === 'all' ||
      (filterRelevance === 'high' && score >= 0.8) ||
      (filterRelevance === 'medium' && score >= 0.5 && score < 0.8) ||
      (filterRelevance === 'low' && score < 0.5);

    return matchesSearch && matchesRelevance;
  });

  // Export policies as CSV
  const handleExportPolicies = () => {
    const csvContent = [
      ['Title', 'Jurisdiction', 'Type', 'Status', 'Updated'],
      ...recentPolicies.map(p => [
        p.title,
        JURISDICTION_NAMES[p.jurisdiction as keyof typeof JURISDICTION_NAMES],
        p.jurisdiction,
        'Active',
        new Date(p.updatedAt).toLocaleDateString('en-AU')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policai-policies-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Policies exported successfully',
    });
  };

  // Move policy to trash
  const handleTrashPolicy = async (policyId: string, title: string) => {
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'trashed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to trash policy');
      }

      toast({
        title: 'Policy Moved to Trash',
        description: `"${title}" has been moved to trash.`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trash policy',
        variant: 'destructive',
      });
    }
  };

  // Restore policy from trash
  const handleRestorePolicy = async (policyId: string, title: string) => {
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore policy');
      }

      toast({
        title: 'Policy Restored',
        description: `"${title}" has been restored.`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to restore policy',
        variant: 'destructive',
      });
    }
  };

  // Permanently delete policy
  const handlePermanentDelete = async (policyId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete policy');
      }

      toast({
        title: 'Policy Deleted',
        description: `"${title}" has been permanently deleted.`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete policy',
        variant: 'destructive',
      });
    }
  };

  // Run data source scraper
  const handleRunScraper = async (sourceId: string, sourceName: string) => {
    setIsRunningSource(sourceId);
    try {
      const response = await fetch('/api/admin/run-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to run scraper');
      }

      toast({
        title: 'Scraper Running',
        description: `${sourceName} scraper has been started. Found ${data.itemsFound || 0} new items.`,
      });

      // Update the source with new data
      setSources(prev => prev.map(s =>
        s.id === sourceId
          ? { ...s, lastRun: new Date().toISOString(), itemsFound: data.itemsFound || s.itemsFound }
          : s
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run scraper',
        variant: 'destructive',
      });
    } finally {
      setIsRunningSource(null);
    }
  };

  // Toggle source enabled/disabled
  const handleToggleSource = (sourceId: string) => {
    setSources(prev => prev.map(s =>
      s.id === sourceId ? { ...s, enabled: !s.enabled } : s
    ));

    const source = sources.find(s => s.id === sourceId);
    toast({
      title: source?.enabled ? 'Source Disabled' : 'Source Enabled',
      description: `${source?.name} has been ${source?.enabled ? 'disabled' : 'enabled'}.`,
    });
  };

  // Get schedule badge color
  const getScheduleBadgeVariant = (schedule: string): "default" | "secondary" | "outline" => {
    switch (schedule) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'monthly': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage content, review AI suggestions, and configure data sources
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAnalyseUrlOpen} onOpenChange={setIsAnalyseUrlOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="h-4 w-4 mr-2" />
                Analyse URL
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Analyse URL for AI Policy Content</DialogTitle>
                <DialogDescription>
                  Enter a URL to analyse with AI and determine if it contains relevant AI policy content
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">URL to Analyse</Label>
                  <Input
                    id="url"
                    placeholder="https://www.example.gov.au/ai-policy"
                    value={urlToAnalyse}
                    onChange={(e) => setUrlToAnalyse(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAnalyseUrlOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAnalyseUrl} disabled={isAnalysing}>
                  {isAnalysing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyse
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Policy title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the policy"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Jurisdiction *</Label>
                    <Select
                      value={formData.jurisdiction}
                      onValueChange={(value) => setFormData({ ...formData, jurisdiction: value })}
                    >
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
                    <Label>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
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
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
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
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sourceUrl">Source URL</Label>
                  <Input
                    id="sourceUrl"
                    placeholder="https://"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="AI ethics, transparency, regulation"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content / Notes</Label>
                  <Textarea
                    id="content"
                    placeholder="Additional content or notes about the policy"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPolicyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPolicy} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Policy'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="review">
            Content Review
            {pendingContent.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingContent.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="trash">
            Trash
            {trashedPolicies.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {trashedPolicies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : policiesCount}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Policies</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+12% this month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : agenciesCount}
                    </div>
                    <p className="text-sm text-muted-foreground">Agencies</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+3 new</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingContent.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Needs attention</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{sources.length}</div>
                    <p className="text-sm text-muted-foreground">Data Sources</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">{sources.filter(s => s.enabled).length} active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates to the database</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPolicies}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{policy.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(policy.updatedAt).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {JURISDICTION_NAMES[policy.jurisdiction as keyof typeof JURISDICTION_NAMES]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleTrashPolicy(policy.id, policy.title)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recentPolicies.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No policies found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI-Suggested Content
                  </CardTitle>
                  <CardDescription>
                    Review content discovered by the AI agent and approve or reject
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPendingContent}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterRelevance} onValueChange={(value: any) => setFilterRelevance(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relevance</SelectItem>
                    <SelectItem value="high">High (&gt;80%)</SelectItem>
                    <SelectItem value="medium">Medium (50-80%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Actions */}
              {selectedItems.size > 0 && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedItems.size} selected
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleBatchApprove}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={handleBatchReject}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedItems(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {filteredContent.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                          <div className="flex-1">
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
                          {(item.aiAnalysis.suggestedType || item.aiAnalysis.suggestedJurisdiction) && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {item.aiAnalysis.suggestedType && (
                                <Badge variant="outline">
                                  Type: {POLICY_TYPE_NAMES[item.aiAnalysis.suggestedType as keyof typeof POLICY_TYPE_NAMES] || item.aiAnalysis.suggestedType}
                                </Badge>
                              )}
                              {item.aiAnalysis.suggestedJurisdiction && (
                                <Badge variant="outline">
                                  {JURISDICTION_NAMES[item.aiAnalysis.suggestedJurisdiction as keyof typeof JURISDICTION_NAMES] || item.aiAnalysis.suggestedJurisdiction}
                                </Badge>
                              )}
                            </div>
                          )}
                          {item.aiAnalysis.tags && item.aiAnalysis.tags.length > 0 && (
                            <div className="mt-2 flex gap-1 flex-wrap">
                              {item.aiAnalysis.tags.slice(0, 5).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                            <div className="mt-4 flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(item)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAndApprove(item)}
                              >
                                Edit & Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleReject(item)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive ml-auto"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredContent.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        {pendingContent.length === 0
                          ? 'No pending content to review'
                          : 'No content matches your filters'}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAnalyseUrlOpen(true)}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Analyse a URL
                      </Button>
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
                Configure and monitor automatic content discovery sources
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sources.length}</div>
                  <p className="text-sm text-muted-foreground">Total Sources</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {sources.filter(s => s.enabled).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Enabled</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {sources.reduce((sum, s) => sum + s.itemsFound, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Items Found</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {sources.filter(s => s.schedule === 'daily').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Daily Scrapers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {sources.map((source) => (
              <Card key={source.id} className={!source.enabled ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            source.enabled && source.status === 'healthy'
                              ? 'bg-green-500'
                              : source.enabled
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <input
                          type="checkbox"
                          checked={source.enabled}
                          onChange={() => handleToggleSource(source.id)}
                          className="h-4 w-4 rounded"
                          title={source.enabled ? 'Disable source' : 'Enable source'}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{source.name}</h3>
                          <Badge variant={getScheduleBadgeVariant(source.schedule)}>
                            {source.schedule}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                          </Badge>
                        </div>
                        <a
                          href={source.url}
                          className="text-sm text-primary hover:underline block"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.url}
                        </a>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          {source.status === 'healthy' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Healthy</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>Error</span>
                            </div>
                          )}
                          <span>•</span>
                          <span>Last run: {new Date(source.lastRun).toLocaleString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="font-medium">{source.itemsFound} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunScraper(source.id, source.name)}
                        disabled={!source.enabled || isRunningSource === source.id}
                      >
                        {isRunningSource === source.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Run Now
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trash Tab */}
        <TabsContent value="trash" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Trashed Policies
                  </CardTitle>
                  <CardDescription>
                    Policies moved to trash. They can be restored or permanently deleted.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {trashedPolicies.map((policy) => (
                    <Card key={policy.id} className="border-l-4 border-l-red-400">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{policy.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {JURISDICTION_NAMES[policy.jurisdiction as keyof typeof JURISDICTION_NAMES]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Trashed {new Date(policy.trashedAt).toLocaleDateString('en-AU')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleRestorePolicy(policy.id, policy.title)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePermanentDelete(policy.id, policy.title)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Permanently
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {trashedPolicies.length === 0 && (
                    <div className="text-center py-12">
                      <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No policies in trash
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
                  Your API key is stored securely in environment variables
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
