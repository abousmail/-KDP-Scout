import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Client is created even without env vars so the app runs in demo mode.
// Connect your Supabase project by adding VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

/*
  Expected Supabase tables
  ─────────────────────────
  Table: searches
    id          uuid primary key default gen_random_uuid()
    user_id     uuid references auth.users(id)
    keyword     text not null
    market      text not null
    opportunity_score text not null
    created_at  timestamptz default now()

  Table: favorites
    id          uuid primary key default gen_random_uuid()
    user_id     uuid references auth.users(id)
    keyword     text not null
    market      text not null
    volume_score int
    competition int
    opportunity_score text not null
    created_at  timestamptz default now()
    unique(user_id, keyword, market)
*/
