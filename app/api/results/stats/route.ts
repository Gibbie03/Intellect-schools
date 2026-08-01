import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [recent, flagged, approved] = await Promise.all([
      supabase
        .from('results')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .gte('created_at', since),
      supabase
        .from('results')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .eq('status', 'Rejected'),
      supabase
        .from('results')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .eq('status', 'Approved'),
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
