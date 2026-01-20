import { NextResponse } from 'next/server';
import { analyzeContentRelevance } from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, sourceUrl } = body;

    if (!content || !sourceUrl) {
      return NextResponse.json(
        { error: 'content and sourceUrl are required', success: false },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured', success: false },
        { status: 500 }
      );
    }

    const analysis = await analyzeContentRelevance(content, sourceUrl);

    return NextResponse.json({
      data: analysis,
      success: true,
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', success: false },
      { status: 500 }
    );
  }
}
