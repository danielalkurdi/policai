import { NextResponse } from 'next/server';
import path from 'path';
import { summarizePolicy } from '@/lib/claude';
import { readJsonFile, writeJsonFile } from '@/lib/file-store';
import type { Policy } from '@/types';

const POLICIES_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');

async function readPolicies(): Promise<Policy[]> {
  return readJsonFile<Policy[]>(POLICIES_FILE_PATH, []);
}

async function writePolicies(policies: Policy[]): Promise<void> {
  return writeJsonFile(POLICIES_FILE_PATH, policies);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jurisdiction = searchParams.get('jurisdiction');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let filteredPolicies = await readPolicies();

  if (jurisdiction) {
    filteredPolicies = filteredPolicies.filter((p) => p.jurisdiction === jurisdiction);
  }

  if (type) {
    filteredPolicies = filteredPolicies.filter((p) => p.type === type);
  }

  if (status) {
    filteredPolicies = filteredPolicies.filter((p) => p.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredPolicies = filteredPolicies.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );
  }

  return NextResponse.json({
    data: filteredPolicies,
    total: filteredPolicies.length,
    success: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, jurisdiction, type, status, effectiveDate, sourceUrl, content, aiSummary, tags, agencies, generateSummary } = body;

    if (!title || !jurisdiction || !type || !status) {
      return NextResponse.json(
        { error: 'Title, jurisdiction, type, and status are required', success: false },
        { status: 400 }
      );
    }

    const policies = await readPolicies();

    // Generate ID from title
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);

    // Check if ID already exists
    const existingIndex = policies.findIndex(p => p.id === id);
    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'A policy with a similar title already exists', success: false },
        { status: 400 }
      );
    }

    // Generate AI summary if requested and API key is available
    let generatedSummary = aiSummary || '';
    let generatedDescription = description || '';

    if (generateSummary !== false && process.env.ANTHROPIC_API_KEY) {
      try {
        const contentToSummarise = content || description || title;
        const summaryResult = await summarizePolicy(title, contentToSummarise);

        if (summaryResult.summary && summaryResult.summary !== 'Unable to generate summary') {
          generatedSummary = summaryResult.summary;

          // If description is empty, use the summary
          if (!description) {
            generatedDescription = summaryResult.summary;
          }
        }
      } catch (summaryError) {
        console.error('Failed to generate AI summary:', summaryError);
        // Continue without AI summary if it fails
      }
    }

    const now = new Date().toISOString();
    const newPolicy: Policy = {
      id,
      title,
      description: generatedDescription,
      jurisdiction,
      type,
      status,
      effectiveDate: effectiveDate || now.split('T')[0],
      agencies: agencies || [],
      sourceUrl: sourceUrl || '',
      content: content || '',
      aiSummary: generatedSummary,
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    };

    policies.unshift(newPolicy);
    await writePolicies(policies);

    return NextResponse.json({
      data: newPolicy,
      success: true,
    });
  } catch (error) {
    console.error('Error adding policy:', error);
    return NextResponse.json(
      { error: 'Failed to add policy', success: false },
      { status: 500 }
    );
  }
}
