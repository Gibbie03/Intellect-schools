import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { STAFF_ROLES, CLASSES } from '@/lib/constants';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ teachers: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { staffId, fullName, role, subject, email, phone, classTeacherOf } = await request.json();

    if (!staffId || !fullName) {
      return NextResponse.json({ error: 'staffId and fullName are required.' }, { status: 400 });
    }
    if (role && !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }
    if (classTeacherOf && !CLASSES.includes(classTeacherOf)) {
      return NextResponse.json({ error: 'Invalid class for Class Teacher Of.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        school_id: school.id,
        staff_id: staffId,
        full_name: fullName,
        role: role || 'Teacher',
        subject: subject || null,
        email: email || null,
        phone: phone || null,
        status: 'Active',
        class_teacher_of: classTeacherOf || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `A staff member with ID "${staffId}" already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ teacher: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
