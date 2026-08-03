import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { isStudentInSection } from '@/lib/sectionScope';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const { status } = await request.json();

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return NextResponse.json({ error: 'status must be Approved, Rejected, or Pending.' }, { status: 400 });
    }

    const { data: before } = await supabase.from('results').select('*').eq('id', id).eq('school_id', school.id).maybeSingle();

    if (!before || !(await isStudentInSection(supabase, school.id, session.role, before.student_id))) {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('results')
      .update({ status })
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      request,
      schoolId: school.id,
      actor: staff.session,
      action: 'result.status_change',
      entityType: 'result',
      entityId: data.id,
      before,
      after: data,
    });

    return NextResponse.json({ result: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
