import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getClassTeacherAssignment } from '@/lib/classTeacher';
import { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type ReportCardInsert = Database['public']['Tables']['report_cards']['Insert'];

const CONDUCT_RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

/**
 * Report cards are restricted to the one teacher assigned as class teacher
 * for that student's class (admins have full access regardless). Returns
 * null if the caller may proceed, or an error message to reject with.
 */
async function checkClassTeacherAccess(
  supabase: ReturnType<typeof getSupabaseClient>,
  schoolId: string,
  role: 'admin' | 'teacher',
  userId: string,
  studentId: string
): Promise<string | null> {
  if (role === 'admin') return null;

  const classTeacherOf = await getClassTeacherAssignment(userId);
  if (!classTeacherOf) {
    return 'You are not assigned as a class teacher. Ask your admin to assign you to a class.';
  }

  const { data: student } = await supabase
    .from('students')
    .select('class')
    .eq('school_id', schoolId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (!student || student.class !== classTeacherOf) {
    return `You can only manage report cards for your class (${classTeacherOf}).`;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    if (!studentId || !session || !term) {
      return NextResponse.json({ error: 'studentId, session, and term are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const accessError = await checkClassTeacherAccess(supabase, school.id, staffSession.role, staffSession.userId, studentId);
    if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

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
      publish,
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

    const accessError = await checkClassTeacherAccess(supabase, school.id, staffSession.role, staffSession.userId, studentId);
    if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

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

    // publish: true finalizes the report card so it becomes visible on the
    // student portal; publish: false reverts it to Draft (e.g. to fix a
    // mistake spotted after publishing). Omitting it leaves the current
    // status untouched, so editing fields on an already-published card
    // doesn't silently unpublish it.
    if (publish === true) {
      update.status = 'Published';
      update.published_at = new Date().toISOString();
    } else if (publish === false) {
      update.status = 'Draft';
      update.published_at = null;
    }

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
