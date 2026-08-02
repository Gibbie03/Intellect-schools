import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type ReportCardInsert = Database['public']['Tables']['report_cards']['Insert'];

const CONDUCT_RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    if (!studentId || !session || !term) {
      return NextResponse.json({ error: 'studentId, session, and term are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('report_cards')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .eq('session', session)
      .eq('term', term)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ reportCard: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Upsert the whole-term parts of a student's report card. Any staff member
// can set attendance/conduct/teacher's comment; principal's comment is
// admin-only (enforced here, not just in the UI).
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const body = await request.json();
    const {
      studentId,
      session,
      term,
      daysSchoolOpened,
      daysPresent,
      timesPunctual,
      conductRating,
      teacherComment,
      principalComment,
    } = body;

    if (!studentId || !session || !term) {
      return NextResponse.json({ error: 'studentId, session, and term are required.' }, { status: 400 });
    }
    if (conductRating && !CONDUCT_RATINGS.includes(conductRating)) {
      return NextResponse.json({ error: 'Invalid conduct rating.' }, { status: 400 });
    }
    if (principalComment !== undefined && staffSession.role !== 'admin') {
      return NextResponse.json({ error: "Only an admin can set the principal's comment." }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const update: ReportCardInsert = {
      school_id: school.id,
      student_id: studentId,
      session,
      term,
      updated_at: new Date().toISOString(),
    };
    if (daysSchoolOpened !== undefined) update.days_school_opened = daysSchoolOpened === '' ? null : Number(daysSchoolOpened);
    if (daysPresent !== undefined) update.days_present = daysPresent === '' ? null : Number(daysPresent);
    if (timesPunctual !== undefined) update.times_punctual = timesPunctual === '' ? null : Number(timesPunctual);
    if (conductRating !== undefined) update.conduct_rating = conductRating || null;
    if (teacherComment !== undefined) update.teacher_comment = teacherComment || null;
    if (principalComment !== undefined) update.principal_comment = principalComment || null;

    const { data, error } = await supabase
      .from('report_cards')
      .upsert(update, { onConflict: 'school_id,student_id,session,term' })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ reportCard: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
