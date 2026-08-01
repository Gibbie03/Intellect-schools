import { getSupabaseClient } from './supabase';
import { Database } from './database.types';

type School = Database['public']['Tables']['schools']['Row'];

function stripPort(host: string) {
  return host.split(':')[0];
}

/**
 * Resolves the current tenant from the request's Host header.
 *
 * - If PLATFORM_ROOT_DOMAIN is set (e.g. "yourplatform.com") and the host ends
 *   with it, everything before that is treated as the school's subdomain.
 * - Otherwise the full host is matched against a school's custom_domain.
 * - If PLATFORM_ROOT_DOMAIN is unset (no real domain configured yet) and no
 *   match is found, this falls back to the single "intellect" tenant so the
 *   existing Vercel preview/production URL keeps working during rollout.
 *   Once PLATFORM_ROOT_DOMAIN is set, an unmatched host resolves to null
 *   (no silent fallback) so real customers can't cross-resolve by mistake.
 *
 * Deliberately not memoized: this is called from both Server Components and
 * plain Route Handlers, and the two don't share the same request-scoping
 * guarantees for React's cache() — for a multi-tenant lookup, a caching bug
 * that leaked one request's resolved school into another's would be a real
 * security issue, not just a performance one. The lookup itself is a single
 * indexed query, so there's no real cost to calling it fresh each time.
 */
export async function getSchoolFromHost(hostHeader: string | null): Promise<School | null> {
  const supabase = getSupabaseClient();
  const host = stripPort(hostHeader ?? '');
  const rootDomain = process.env.PLATFORM_ROOT_DOMAIN;

  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.slice(0, -(rootDomain.length + 1));
    const { data } = await supabase.from('schools').select('*').eq('subdomain', subdomain).maybeSingle();
    return data ?? null;
  }

  if (host) {
    const { data } = await supabase.from('schools').select('*').eq('custom_domain', host).maybeSingle();
    if (data) return data;
  }

  if (!rootDomain) {
    const { data } = await supabase.from('schools').select('*').eq('subdomain', 'intellect').maybeSingle();
    return data ?? null;
  }

  return null;
}
