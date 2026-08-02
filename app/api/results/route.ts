import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { gradeFromScore, resolveScore } from '@/lib/grade';
import { requireSchoolSession } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

// FIX NOTE: previously unauthenticated (no session check at all), so anyone
// could list every result for the school -- including Pending/Rejected
// drafts never meant to be visible to a student -- for any or all students,
// just by supplying a Host header. A studentId+status=Approved lookup used
// to be left open for app/portal's benefit; that public path now goes
// through /api/portal/check instead (gated by a scratch-card PIN), so this
// route is staff-only across the board.
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();

    const studentId = request.nextUrl.searchParams.get('studentId');
    const status = request.nextUrl.searchParams.get('status') as 'Pending' | 'Approved' | 'Rejected' | null;
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');

    let query = supabase.from('results').select('*').eq('school_id', school.id).order('created_at', { ascending: false });
    if (studentId) query = query.eq('student_id', studentId);
    if (status) query = query.eq('status', status);
    if (session) query = query.eq('session', session);
    if (term) query = query.eq('term', term);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ results: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'teacher']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { studentId, subject, score, caScore, examScore, session, term, uploadedBy } = body;

    if (!studentId || !subject || !session || !term) {
      return NextResponse.json(
        { error: 'studentId, subject, session, and term are required.' },
        { status: 400 }
      );
    }

    let resolved;
    try {
      resolved = resolveScore({ score, caScore, examScore });
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('results')
      .insert({
        school_id: school.id,
        student_id: studentId,
        subject,
        score: resolved.total,
        ca_score: resolved.caScore,
        exam_score: resolved.examScore,
        grade: gradeFromScore(resolved.total),
        session,
        term,
        status: 'Approved',
        uploaded_by: uploadedBy ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      request,
      schoolId: school.id,
      actor: staff.session,
      action: 'result.create',
      entityType: 'result',
      entityId: data.id,
      after: data,
    });

    return NextResponse.json({ result: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
