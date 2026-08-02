import { NextRequest } from 'next/server';
import { getSupabaseClient } from './supabase';

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Fixed-window rate limiter backed by Postgres -- reuses the same Supabase
 * project everything else does rather than standing up Redis/Upstash just
 * for this. Fails open (allows the request) if the limiter itself errors,
 * so a database hiccup never locks everyone out of logging in.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const windowStartMs = Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000;
  const retryAfterSeconds = Math.max(windowSeconds - Math.floor((Date.now() - windowStartMs) / 1000), 1);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_window_start: new Date(windowStartMs).toISOString(),
    });
    if (error) throw error;

    // No cron job in this deployment to prune old rows -- piggyback a
    // low-probability cleanup on regular checks instead.
    if (Math.random() < 0.02) {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabase.from('rate_limit_hits').delete().lt('window_start', cutoff);
    }

    return { allowed: (data ?? 0) <= limit, retryAfterSeconds };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
