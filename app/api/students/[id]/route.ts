import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';
import { CLASSES } from '@/lib/constants';
import { logAudit } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

type StudentUpdate = Database['public']['Tables']['students']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const update: StudentUpdate = {};

    if (body.status !== undefined) {
      if (!['Active', 'Inactive'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Active or Inactive.' }, { status: 400 });
      }
      update.status = body.status as StudentUpdate['status'];
    }

    if (body.className !== undefined) {
      if (!CLASSES.includes(body.className)) {
        return NextResponse.json({ error: 'Invalid class.' }, { status: 400 });
      }
      update.class = body.className;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .update(update)
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ student: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Removes the student profile itself (expulsion, or a duplicate/mistaken
// entry). Historical records tied to their student_id -- results, report
// cards, attendance, fees -- are intentionally left in place rather than
// cascade-deleted, since those are academic/financial records the school
// may still need after the profile is gone; "Inactive" status is the right
// choice for a normal leaver/graduate, this is for removing the record
// entirely.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;

    const { data: before } = await supabase.from('students').select('*').eq('id', id).eq('school_id', school.id).maybeSingle();

    const { error } = await supabase.from('students').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;

    await logAudit({
      request,
      schoolId: school.id,
      actor: staff.session,
      action: 'student.delete',
      entityType: 'student',
      entityId: id,
      before,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
