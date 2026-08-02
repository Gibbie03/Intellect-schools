import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();
    const entityType = request.nextUrl.searchParams.get('entityType');
    const page = Math.max(Number(request.nextUrl.searchParams.get('page')) || 1, 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .eq('school_id', school.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (entityType) query = query.eq('entity_type', entityType);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data, total: count ?? 0, page, pageSize: PAGE_SIZE });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
