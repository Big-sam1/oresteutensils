import { createClient, SupabaseClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const configuredSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  configuredSupabaseUrl && configuredSupabaseKey
);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY',
    '\n  → Set them in Vercel Dashboard > Settings > Environment Variables'
  );
}

// Keep the client constructible so missing deployment variables do not blank the app.
export const supabase: SupabaseClient = createClient(
  configuredSupabaseUrl || 'https://placeholder.supabase.co',
  configuredSupabaseKey || 'placeholder-anon-key'
);
