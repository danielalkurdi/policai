import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Verify authentication for API routes
 * Returns the user if authenticated, or null if not
 */
export async function verifyAuth(request: Request) {
  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not configured');
    return null;
  }

  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  // Also check for cookie-based auth
  const cookieHeader = request.headers.get('cookie');

  if (!authHeader && !cookieHeader) {
    return null;
  }

  try {
    // Create a Supabase client for this request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || '',
          Cookie: cookieHeader || '',
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Returns an unauthorized response for API routes
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized - Admin authentication required', success: false },
    { status: 401 }
  );
}
