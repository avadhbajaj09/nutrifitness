import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://punhmwlpaghmjndpyusf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bmhtd2xwYWdobWpuZHB5dXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwODM3NzcsImV4cCI6MjEwNjY1OTc3N30.OVKPb7uugpCuXamYCqv-q7jTiPhNLxzAG1oMkQ9L6iU';

// Browser client for public operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client with service role
let adminClient: SupabaseClient | null = null;
export function getAdminSupabase(): SupabaseClient {
  if (!adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bmhtd2xwYWdobWpuZHB5dXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTA4Mzc3NywiZXhwIjoyMTA2NjU5Nzc3fQ.zansLPHjqNj1IupmtuodY5GOgNO2QNjtFXEoym_J8Uk';
    adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}
