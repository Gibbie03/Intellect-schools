import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [recent, flagged, approved] = await Promise.all([
      supabase.from('results').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('results').select('id', { count: 'exact', head: true }).eq('status', 'Rejected'),
      supabase.from('results').select('id', { count: 'exact', head: true }).eq('status', 'Approved'),
    ]);

    if (recent.error) throw recent.error;
    if (flagged.error) throw flagged.error;
    if (approved.error) throw approved.error;

    return NextResponse.json({
      uploadedLast24h: recent.count ?? 0,
      flagged: flagged.count ?? 0,
      approved: approved.count ?? 0,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
