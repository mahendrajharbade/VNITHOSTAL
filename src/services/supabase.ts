import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
export const SUPABASE_PROJECT_ID = 'ftaywnbgjsnewoxnajys';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ftaywnbgjsnewoxnajys.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Vaq6sFU999LbaNq8bgu9IQ_QzoSuSQP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
