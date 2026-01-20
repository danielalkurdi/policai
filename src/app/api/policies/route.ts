import { NextResponse } from 'next/server';
import policiesData from '@/../public/data/sample-policies.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jurisdiction = searchParams.get('jurisdiction');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let filteredPolicies = [...policiesData];

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
        p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  return NextResponse.json({
    data: filteredPolicies,
    total: filteredPolicies.length,
    success: true,
  });
}
