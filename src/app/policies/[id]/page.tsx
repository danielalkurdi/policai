import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import {
  ArrowLeft,
  Calendar,
  Building2,
  ExternalLink,
  FileText,
  Tag,
  Clock,
  Bot,
  Share2,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
  type Jurisdiction,
  type PolicyType,
  type PolicyStatus,
} from '@/types';

interface Policy {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  type: string;
  status: string;
  effectiveDate: string;
  agencies: string[];
  sourceUrl: string;
  content: string;
  aiSummary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

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

async function getPolicy(id: string): Promise<Policy | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const policies: Policy[] = JSON.parse(data);
    return policies.find(p => p.id === id) || null;
  } catch {
    return null;
  }
}

async function getRelatedPolicies(currentPolicy: Policy): Promise<Policy[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const policies: Policy[] = JSON.parse(data);

    // Find policies with similar tags or same jurisdiction
    return policies
      .filter(p => p.id !== currentPolicy.id && p.status !== 'trashed')
      .filter(p =>
        p.jurisdiction === currentPolicy.jurisdiction ||
        p.tags.some(tag => currentPolicy.tags.includes(tag))
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const policies: Policy[] = JSON.parse(data);
    return policies.map(policy => ({ id: policy.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await getPolicy(id);

  if (!policy) {
    return {
      title: 'Policy Not Found - Policai',
    };
  }

  return {
    title: `${policy.title} - Policai`,
    description: policy.description,
    keywords: policy.tags,
  };
}

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await getPolicy(id);

  if (!policy) {
    notFound();
  }

  const relatedPolicies = await getRelatedPolicies(policy);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/policies" className="hover:text-foreground">Policies</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[200px]">{policy.title}</span>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/policies">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-4">
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
              <CardTitle className="text-2xl md:text-3xl">{policy.title}</CardTitle>
              <CardDescription className="text-base mt-4">
                {policy.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                {policy.sourceUrl && (
                  <Button asChild>
                    <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </a>
                  </Button>
                )}
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary Card */}
          {policy.aiSummary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
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

          {/* Content Card */}
          {policy.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Policy Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {policy.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags Card */}
          {policy.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {policy.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agencies Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Responsible Agencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policy.agencies.map((agency) => (
                  <div
                    key={agency}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{agency.toUpperCase()}</p>
                      <Link
                        href={`/agencies`}
                        className="text-xs text-primary hover:underline"
                      >
                        View agency details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={statusColors[policy.status] || 'bg-gray-100'}
                >
                  {POLICY_STATUS_NAMES[policy.status as PolicyStatus] || policy.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium">
                  {POLICY_TYPE_NAMES[policy.type as PolicyType] || policy.type}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Jurisdiction</span>
                <span className="text-sm font-medium">
                  {JURISDICTION_NAMES[policy.jurisdiction as Jurisdiction] || policy.jurisdiction}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Effective Date</span>
                <span className="text-sm font-medium">
                  {new Date(policy.effectiveDate).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {new Date(policy.updatedAt).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Policies Card */}
          {relatedPolicies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedPolicies.map((related) => (
                  <Link
                    key={related.id}
                    href={`/policies/${related.id}`}
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {related.title}
                    </h4>
                    <div className="flex items-center gap-2">
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
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
