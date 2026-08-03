import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getSectionClasses } from '@/lib/constants';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Curriculum data, not sensitive -- any signed-in staff member (including
// teachers, who need this to know what subjects they can enter results for)
// can read it. Only admin-type roles can edit it.
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const className = request.nextUrl.searchParams.get('class');
    const supabase = getSupabaseClient();

    let query = supabase.from('class_subjects').select('*').eq('school_id', school.id).order('subject', { ascending: true });
    if (className) query = query.eq('class', className);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ subjects: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { class: className, subject } = await request.json();
    if (!className || !subject) {
      return NextResponse.json({ error: 'class and subject are required.' }, { status: 400 });
    }

    const sectionClasses = getSectionClasses(session.role);
    if (sectionClasses && !sectionClasses.includes(className)) {
      return NextResponse.json({ error: 'You do not have access to that class.' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('class_subjects')
      .insert({ school_id: school.id, class: className, subject: String(subject).trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `"${subject}" is already in ${className}'s subject list.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ subject: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
