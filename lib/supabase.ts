import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in your environment.');
  }

  client = createClient<Database>(url, secretKey, {
    auth: { persistSession: false },
  });

  return client;
}
