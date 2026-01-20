import { createClient } from '@supabase/supabase-js';
import type { Policy, Agency, NewsItem, TimelineEvent } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching Supabase schema
export interface Database {
  public: {
    Tables: {
      policies: {
        Row: Policy;
        Insert: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Policy, 'id'>>;
      };
      agencies: {
        Row: Agency;
        Insert: Omit<Agency, 'id'>;
        Update: Partial<Omit<Agency, 'id'>>;
      };
      news_items: {
        Row: NewsItem;
        Insert: Omit<NewsItem, 'id'>;
        Update: Partial<Omit<NewsItem, 'id'>>;
      };
      timeline_events: {
        Row: TimelineEvent;
        Insert: Omit<TimelineEvent, 'id'>;
        Update: Partial<Omit<TimelineEvent, 'id'>>;
      };
    };
  };
}

// Policy operations
export async function getPolicies(filters?: {
  jurisdiction?: string;
  type?: string;
  status?: string;
  search?: string;
}) {
  let query = supabase.from('policies').select('*');

  if (filters?.jurisdiction) {
    query = query.eq('jurisdiction', filters.jurisdiction);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('effectiveDate', { ascending: false });
  return { data, error };
}

export async function getPolicyById(id: string) {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createPolicy(policy: Database['public']['Tables']['policies']['Insert']) {
  const { data, error } = await supabase
    .from('policies')
    .insert(policy)
    .select()
    .single();
  return { data, error };
}

export async function updatePolicy(id: string, updates: Database['public']['Tables']['policies']['Update']) {
  const { data, error } = await supabase
    .from('policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Agency operations
export async function getAgencies(filters?: {
  level?: string;
  jurisdiction?: string;
}) {
  let query = supabase.from('agencies').select('*');

  if (filters?.level) {
    query = query.eq('level', filters.level);
  }
  if (filters?.jurisdiction) {
    query = query.eq('jurisdiction', filters.jurisdiction);
  }

  const { data, error } = await query.order('name');
  return { data, error };
}

export async function getAgencyById(id: string) {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// News operations
export async function getNewsItems(limit = 10) {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('publishedDate', { ascending: false })
    .limit(limit);
  return { data, error };
}

// Timeline operations
export async function getTimelineEvents(filters?: {
  jurisdiction?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  let query = supabase.from('timeline_events').select('*');

  if (filters?.jurisdiction) {
    query = query.eq('jurisdiction', filters.jurisdiction);
  }
  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  const { data, error } = await query.order('date', { ascending: true });
  return { data, error };
}

// Stats operations
export async function getJurisdictionStats() {
  const { data: policies, error } = await supabase
    .from('policies')
    .select('jurisdiction, status');

  if (error) return { data: null, error };

  const stats = (policies || []).reduce((acc, policy) => {
    const key = policy.jurisdiction;
    if (!acc[key]) {
      acc[key] = { total: 0, active: 0 };
    }
    acc[key].total++;
    if (policy.status === 'active') {
      acc[key].active++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number }>);

  return { data: stats, error: null };
}
