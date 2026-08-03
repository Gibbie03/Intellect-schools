import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';
import { getSectionClasses } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Public read (a visitor picks a class and sees its weekly timetable, no
// login needed -- nothing here is sensitive). Writing is admin-only.
export async function GET(request: NextRequest) {
  try {
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const className = request.nextUrl.searchParams.get('class');
    if (!className) return NextResponse.json({ error: 'class is required.' }, { status: 400 });

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('class_timetables')
      .select('*')
      .eq('school_id', school.id)
      .eq('class', className)
      .order('period_number', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Replaces the whole timetable for one class in a single request -- the
// admin edits a full weekly grid, and saving swaps in the new set rather
// than requiring a per-cell upsert dance.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { class: className, entries } = await request.json();
    if (!className || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'class and an entries array are required.' }, { status: 400 });
    }
    const sectionClasses = getSectionClasses(session.role);
    if (sectionClasses && !sectionClasses.includes(className)) {
      return NextResponse.json({ error: 'You do not have access to that class.' }, { status: 403 });
    }

    const rows = entries
      .filter((e) => e?.subject)
      .map((e) => {
        if (!DAYS.includes(e.dayOfWeek)) throw new Error(`Invalid day: ${e.dayOfWeek}`);
        const periodNumber = Number(e.periodNumber);
        if (!periodNumber || periodNumber < 1) throw new Error('Invalid period number.');
        return {
          school_id: school.id,
          class: className,
          day_of_week: e.dayOfWeek,
          period_number: periodNumber,
          start_time: e.startTime || null,
          end_time: e.endTime || null,
          subject: e.subject,
          teacher_name: e.teacherName || null,
        };
      });

    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from('class_timetables')
      .delete()
      .eq('school_id', school.id)
      .eq('class', className);
    if (deleteError) throw deleteError;

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from('class_timetables').insert(rows);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ saved: rows.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
