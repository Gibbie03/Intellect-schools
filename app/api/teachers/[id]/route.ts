import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { STAFF_ROLES, CLASSES, getSectionClasses } from '@/lib/constants';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const update: TeacherUpdate = {};
    const sectionClasses = getSectionClasses(session.role);

    if (sectionClasses) {
      const { data: existing } = await supabase
        .from('teachers')
        .select('class_teacher_of')
        .eq('id', id)
        .eq('school_id', school.id)
        .maybeSingle();
      if (!existing || (existing.class_teacher_of && !sectionClasses.includes(existing.class_teacher_of))) {
        return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
      }
    }

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

    if (body.classTeacherOf !== undefined) {
      if (body.classTeacherOf && !CLASSES.includes(body.classTeacherOf)) {
        return NextResponse.json({ error: 'Invalid class for Class Teacher Of.' }, { status: 400 });
      }
      if (sectionClasses && body.classTeacherOf && !sectionClasses.includes(body.classTeacherOf)) {
        return NextResponse.json({ error: 'You do not have access to assign a class teacher for that class.' }, { status: 403 });
      }
      update.class_teacher_of = body.classTeacherOf || null;
    }

    if (body.campus !== undefined) update.campus = body.campus || null;
    if (body.photoUrl !== undefined) update.photo_url = body.photoUrl || null;
    if (body.bio !== undefined) update.bio = body.bio || null;
    if (body.showOnSite !== undefined) update.show_on_site = Boolean(body.showOnSite);

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
    return apiError(error);
  }
}
