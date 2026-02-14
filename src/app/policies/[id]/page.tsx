import { notFound } from 'next/navigation';
import Link from 'next/link';
import path from 'path';
import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type Policy,
} from '@/types';
import { readJsonFile } from '@/lib/file-store';
import { PolicyDetailTabs } from './policy-detail-tabs';

const POLICIES_FILE = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');

async function getPolicy(id: string): Promise<Policy | null> {
  const policies = await readJsonFile<Policy[]>(POLICIES_FILE, []);
  return policies.find(p => p.id === id) || null;
}

async function getRelatedPolicies(currentPolicy: Policy): Promise<Policy[]> {
  const policies = await readJsonFile<Policy[]>(POLICIES_FILE, []);

  return policies
    .filter(p => p.id !== currentPolicy.id && p.status !== 'trashed')
    .filter(p =>
      p.jurisdiction === currentPolicy.jurisdiction ||
      p.tags.some(tag => currentPolicy.tags.includes(tag))
    )
    .slice(0, 3);
}

export async function generateStaticParams() {
  const policies = await readJsonFile<Policy[]>(POLICIES_FILE, []);
  return policies.map(policy => ({ id: policy.id }));
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
        <span className="text-foreground truncate max-w-[150px] sm:max-w-[300px]">{policy.title}</span>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/policies">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Link>
      </Button>

      <PolicyDetailTabs policy={policy} relatedPolicies={relatedPolicies} />
    </div>
  );
}
