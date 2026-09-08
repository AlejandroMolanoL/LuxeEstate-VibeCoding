import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client using cookies for session persistence across client and server
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export * from './supabase/client';
