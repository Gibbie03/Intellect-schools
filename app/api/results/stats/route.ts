import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getSectionStudentIds } from '@/lib/sectionScope';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;

    const supabase = getSupabaseClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const sectionStudentIds = await getSectionStudentIds(supabase, school.id, session.role, session.userId);
    const scopeIds = sectionStudentIds && sectionStudentIds.length > 0 ? sectionStudentIds : sectionStudentIds ? ['__none__'] : null;

    let recentQuery = supabase.from('results').select('id', { count: 'exact', head: true }).eq('school_id', school.id).gte('created_at', since);
    let flaggedQuery = supabase.from('results').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'Rejected');
    let approvedQuery = supabase.from('results').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'Approved');

    if (scopeIds) {
      recentQuery = recentQuery.in('student_id', scopeIds);
      flaggedQuery = flaggedQuery.in('student_id', scopeIds);
      approvedQuery = approvedQuery.in('student_id', scopeIds);
    }

    const [recent, flagged, approved] = await Promise.all([recentQuery, flaggedQuery, approvedQuery]);

    if (recent.error) throw recent.error;
    if (flagged.error) throw flagged.error;
    if (approved.error) throw approved.error;

    return NextResponse.json({
      uploadedLast24h: recent.count ?? 0,
      flagged: flagged.count ?? 0,
      approved: approved.count ?? 0,
    });
  } catch (error) {
    return apiError(error);
  }
}
