import { NextResponse } from 'next/server';
import path from 'path';
import { readJsonFile, writeJsonFile } from '@/lib/file-store';
import type { Policy } from '@/types';

interface PolicyWithTrash extends Policy {
  trashedAt?: string;
}

const POLICIES_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'sample-policies.json');

async function readPolicies(): Promise<PolicyWithTrash[]> {
  return readJsonFile<PolicyWithTrash[]>(POLICIES_FILE_PATH, []);
}

async function writePolicies(policies: PolicyWithTrash[]): Promise<void> {
  return writeJsonFile(POLICIES_FILE_PATH, policies);
}

// GET - Retrieve a single policy by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const policies = await readPolicies();
    const policy = policies.find(p => p.id === id);

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: policy,
      success: true,
    });
  } catch (error) {
    console.error('Error reading policy:', error);
    return NextResponse.json(
      { error: 'Failed to read policy', success: false },
      { status: 500 }
    );
  }
}

// PATCH - Update a policy
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const policies = await readPolicies();
    const policyIndex = policies.findIndex(p => p.id === id);

    if (policyIndex === -1) {
      return NextResponse.json(
        { error: 'Policy not found', success: false },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Handle status changes specially
    if (body.status === 'trashed' && policies[policyIndex].status !== 'trashed') {
      policies[policyIndex].trashedAt = now;
    } else if (body.status && body.status !== 'trashed' && policies[policyIndex].status === 'trashed') {
      delete policies[policyIndex].trashedAt;
    }

    // Update the policy
    policies[policyIndex] = {
      ...policies[policyIndex],
      ...body,
      updatedAt: now,
    };

    await writePolicies(policies);

    return NextResponse.json({
      data: policies[policyIndex],
      success: true,
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete a policy
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const policies = await readPolicies();
    const policyIndex = policies.findIndex(p => p.id === id);

    if (policyIndex === -1) {
      return NextResponse.json(
        { error: 'Policy not found', success: false },
        { status: 404 }
      );
    }

    policies.splice(policyIndex, 1);
    await writePolicies(policies);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy', success: false },
      { status: 500 }
    );
  }
}
