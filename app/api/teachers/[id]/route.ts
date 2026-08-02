import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { STAFF_ROLES } from '@/lib/constants';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const update: TeacherUpdate = {};

    if (body.role !== undefined) {
      if (!STAFF_ROLES.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      }
      update.role = body.role as TeacherUpdate['role'];
    }

    if (body.status !== undefined) {
      if (!['Active', 'Inactive'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Active or Inactive.' }, { status: 400 });
      }
      update.status = body.status as TeacherUpdate['status'];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('teachers')
      .update(update)
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ teacher: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
