import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_SUPABASE_PROD_URL!
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
const supabaseAnonKey = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY!
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anonymous key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Separate client for service role access
const supabaseServiceRoleKey = process.env.NODE_ENV === 'production'
  ? process.env.SUPABASE_PROD_SERVICE_ROLE_KEY!
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceRoleKey) {
  console.warn('Supabase service role key is missing. Admin operations will be restricted.');
}

export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to anon client if service key is not available 