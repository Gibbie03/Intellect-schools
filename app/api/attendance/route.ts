import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getClassTeacherAssignment } from '@/lib/classTeacher';
import { getSectionClasses } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const STATUSES = ['Present', 'Absent', 'Late'];

/**
 * Attendance is restricted to the one teacher assigned as class teacher for
 * that class -- same model as report cards. The unscoped 'admin' role has
 * full access regardless; 'primary_admin'/'secondary_admin' have full
 * access within their own section. Returns null if the caller may proceed,
 * or an error message.
 */
async function checkClassAccess(
  role: 'admin' | 'primary_admin' | 'secondary_admin' | 'teacher',
  userId: string,
  className: string
): Promise<string | null> {
  if (role === 'admin') return null;

  const sectionClasses = getSectionClasses(role);
  if (sectionClasses) {
    return sectionClasses.includes(className) ? null : 'You do not have access to attendance for that class.';
  }

  const classTeacherOf = await getClassTeacherAssignment(userId);
  if (!classTeacherOf) {
    return 'You are not assigned as a class teacher. Ask your admin to assign you to a class.';
  }
  if (classTeacherOf !== className) {
    return `You can only manage attendance for your class (${classTeacherOf}).`;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const supabase = getSupabaseClient();
    const className = request.nextUrl.searchParams.get('class');
    const date = request.nextUrl.searchParams.get('date');
    const studentId = request.nextUrl.searchParams.get('studentId');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');

    // Mode 1: a single student's attendance summary for a session/term
    // (no class/date) -- used to auto-fill "days present" on a report card.
    if (studentId && session && term && !className && !date) {
      const { data: student } = await supabase
        .from('students')
        .select('class')
        .eq('school_id', school.id)
        .eq('student_id', studentId)
        .maybeSingle();
      if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

      const accessError = await checkClassAccess(staffSession.role, staffSession.userId, student.class);
      if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('school_id', school.id)
        .eq('student_id', studentId)
        .eq('session', session)
        .eq('term', term);
      if (error) throw error;

      const totalDays = data?.length ?? 0;
      const daysPresent = data?.filter((r) => r.status === 'Present' || r.status === 'Late').length ?? 0;
      return NextResponse.json({ totalDays, daysPresent });
    }

    // Mode 2: a class's roster + marks for one day.
    if (!className || !date) {
      return NextResponse.json({ error: 'class and date are required (or studentId, session, and term).' }, { status: 400 });
    }

    const accessError = await checkClassAccess(staffSession.role, staffSession.userId, className);
    if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

    const { data: roster, error: rosterError } = await supabase
      .from('students')
      .select('id, student_id, full_name')
      .eq('school_id', school.id)
      .eq('class', className)
      .eq('status', 'Active')
      .order('full_name', { ascending: true });
    if (rosterError) throw rosterError;

    const { data: marks, error: marksError } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('school_id', school.id)
      .eq('class', className)
      .eq('date', date);
    if (marksError) throw marksError;

    return NextResponse.json({ roster, marks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const { class: className, date, session, term, records } = await request.json();

    if (!className || !date || !session || !term || !Array.isArray(records)) {
      return NextResponse.json({ error: 'class, date, session, term, and records are required.' }, { status: 400 });
    }
    for (const record of records) {
      if (!record.studentId || !STATUSES.includes(record.status)) {
        return NextResponse.json({ error: 'Each record needs a studentId and a valid status.' }, { status: 400 });
      }
    }

    const accessError = await checkClassAccess(staffSession.role, staffSession.userId, className);
    if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

    const supabase = getSupabaseClient();
    const rows = records.map((r: { studentId: string; status: 'Present' | 'Absent' | 'Late' }) => ({
      school_id: school.id,
      student_id: r.studentId,
      class: className as string,
      session: session as string,
      term: term as string,
      date: date as string,
      status: r.status,
    }));

    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'school_id,student_id,date' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
