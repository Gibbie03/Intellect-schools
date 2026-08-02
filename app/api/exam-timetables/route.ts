import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public read, same reasoning as class timetables -- exam dates aren't
// sensitive and parents/students should see them without logging in.
export async function GET(request: NextRequest) {
  try {
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const className = request.nextUrl.searchParams.get('class');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    if (!className || !session || !term) {
      return NextResponse.json({ error: 'class, session, and term are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('exam_timetables')
      .select('*')
      .eq('school_id', school.id)
      .eq('class', className)
      .eq('session', session)
      .eq('term', term)
      .order('exam_date', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { class: className, session, term, subject, examDate, startTime, endTime, venue } = await request.json();
    if (!className || !session || !term || !subject || !examDate) {
      return NextResponse.json({ error: 'class, session, term, subject, and examDate are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('exam_timetables')
      .insert({
        school_id: school.id,
        class: className,
        session,
        term,
        subject,
        exam_date: examDate,
        start_time: startTime || null,
        end_time: endTime || null,
        venue: venue || null,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
