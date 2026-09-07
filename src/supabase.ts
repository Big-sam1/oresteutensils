import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY',
    '\n  → Set them in Vercel Dashboard > Settings > Environment Variables'
  );
}

// createClient() is safe even with placeholder values — individual queries will
// fail gracefully rather than crashing the whole app on startup.
export const supabase: SupabaseClient = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseKey  ?? 'placeholder-anon-key'
);
