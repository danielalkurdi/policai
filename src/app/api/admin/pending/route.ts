import { NextResponse } from 'next/server';
import path from 'path';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { readJsonFile, writeJsonFile } from '@/lib/file-store';

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

const PENDING_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'pending-content.json');

async function readPendingContent(): Promise<PendingItem[]> {
  return readJsonFile<PendingItem[]>(PENDING_FILE_PATH, []);
}

async function writePendingContent(items: PendingItem[]): Promise<void> {
  return writeJsonFile(PENDING_FILE_PATH, items);
}

// GET - Retrieve all pending content
export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let items = await readPendingContent();

    if (status) {
      items = items.filter(item => item.status === status);
    }

    return NextResponse.json({
      data: items,
      total: items.length,
      success: true,
    });
  } catch (error) {
    console.error('Error reading pending content:', error);
    return NextResponse.json(
      { error: 'Failed to read pending content', success: false },
      { status: 500 }
    );
  }
}

// POST - Add new pending content
export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { url, title, analysis } = body;

    if (!url || !analysis) {
      return NextResponse.json(
        { error: 'URL and analysis are required', success: false },
        { status: 400 }
      );
    }

    const items = await readPendingContent();

    // Check if URL already exists
    const existingIndex = items.findIndex(item => item.source === url);
    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'URL already exists in pending content', success: false },
        { status: 400 }
      );
    }

    const newItem: PendingItem = {
      id: `pending-${Date.now()}`,
      title: title || 'Untitled',
      source: url,
      discoveredAt: new Date().toISOString(),
      status: 'pending_review',
      aiAnalysis: {
        isRelevant: analysis.isRelevant,
        relevanceScore: analysis.relevanceScore,
        suggestedType: analysis.policyType || null,
        suggestedJurisdiction: analysis.jurisdiction || null,
        summary: analysis.summary,
        tags: analysis.tags,
        agencies: analysis.agencies,
      },
    };

    items.unshift(newItem);
    await writePendingContent(items);

    return NextResponse.json({
      data: newItem,
      success: true,
    });
  } catch (error) {
    console.error('Error adding pending content:', error);
    return NextResponse.json(
      { error: 'Failed to add pending content', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update pending content status (approve/reject)
export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required', success: false },
        { status: 400 }
      );
    }

    if (!['pending_review', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', success: false },
        { status: 400 }
      );
    }

    const items = await readPendingContent();
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Pending content not found', success: false },
        { status: 404 }
      );
    }

    items[itemIndex].status = status;
    await writePendingContent(items);

    return NextResponse.json({
      data: items[itemIndex],
      success: true,
    });
  } catch (error) {
    console.error('Error updating pending content:', error);
    return NextResponse.json(
      { error: 'Failed to update pending content', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Remove pending content
export async function DELETE(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required', success: false },
        { status: 400 }
      );
    }

    const items = await readPendingContent();
    const filteredItems = items.filter(item => item.id !== id);

    if (items.length === filteredItems.length) {
      return NextResponse.json(
        { error: 'Pending content not found', success: false },
        { status: 404 }
      );
    }

    await writePendingContent(filteredItems);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting pending content:', error);
    return NextResponse.json(
      { error: 'Failed to delete pending content', success: false },
      { status: 500 }
    );
  }
}
