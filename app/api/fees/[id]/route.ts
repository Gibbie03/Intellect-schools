import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';
import { isStudentInSection } from '@/lib/sectionScope';

export const dynamic = 'force-dynamic';

type FeeUpdate = Database['public']['Tables']['fees']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase.from('fees').select('student_id').eq('id', id).eq('school_id', school.id).maybeSingle();
    if (!existing || !(await isStudentInSection(supabase, school.id, session.role, existing.student_id))) {
      return NextResponse.json({ error: 'Fee record not found.' }, { status: 404 });
    }

    const body = await request.json();
    const update: FeeUpdate = {};

    if (body.status !== undefined) {
      if (!['Unpaid', 'Paid'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Unpaid or Paid.' }, { status: 400 });
      }
      update.status = body.status;
    }
    if (body.reminded === true) {
      update.last_reminded_at = new Date().toISOString();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fees')
      .update(update)
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ fee: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase.from('fees').select('student_id').eq('id', id).eq('school_id', school.id).maybeSingle();
    if (!existing || !(await isStudentInSection(supabase, school.id, session.role, existing.student_id))) {
      return NextResponse.json({ error: 'Fee record not found.' }, { status: 404 });
    }

    const { error } = await supabase.from('fees').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
