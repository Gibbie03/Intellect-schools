import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getClassTeacherAssignment } from '@/lib/classTeacher';
import { logAudit } from '@/lib/auditLog';
import { Database } from '@/lib/database.types';
import { getSectionClasses, getClassSection, SECTION_ADMIN_ROLE } from '@/lib/constants';
import { sectionHeadExists } from '@/lib/sectionScope';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

type ReportCardInsert = Database['public']['Tables']['report_cards']['Insert'];

const CONDUCT_RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

/**
 * Report cards are restricted to the one teacher assigned as class teacher
 * for that student's class. The unscoped 'admin' role has full access
 * regardless; 'primary_admin'/'secondary_admin' have full access within
 * their own section (not tied to being that exact class's teacher), but not
 * the other section. Returns null if the caller may proceed, or an error
 * message to reject with.
 */
async function checkClassTeacherAccess(
  supabase: ReturnType<typeof getSupabaseClient>,
  schoolId: string,
  role: 'admin' | 'primary_admin' | 'secondary_admin' | 'teacher',
  userId: string,
  studentId: string
): Promise<string | null> {
  if (role === 'admin') return null;

  const sectionClasses = getSectionClasses(role);
  if (sectionClasses) {
    const { data: student } = await supabase
      .from('students')
      .select('class')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (!student || !sectionClasses.includes(student.class)) {
      return 'You do not have access to report cards for that student.';
    }
    return null;
  }

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
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
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

    const { data: student } = await supabase
      .from('students')
      .select('class')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .maybeSingle();
    const section = student ? getClassSection(student.class) : null;

    let canSetHeadComment = staffSession.role !== 'teacher';
    if (staffSession.role === 'primary_admin') canSetHeadComment = section === 'Primary';
    else if (staffSession.role === 'secondary_admin') canSetHeadComment = section === 'Secondary';
    else if (staffSession.role === 'admin' && section) {
      canSetHeadComment = !(await sectionHeadExists(supabase, school.id, SECTION_ADMIN_ROLE[section]));
    }

    const { data, error } = await supabase
      .from('report_cards')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .eq('session', session)
      .eq('term', term)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ reportCard: data, section, canSetHeadComment });
  } catch (error) {
    return apiError(error);
  }
}

// Upsert the whole-term parts of a student's report card. Any staff member
// can set attendance/conduct/teacher's comment; the head-of-section comment
// is restricted to that section's headmaster/principal (or the unscoped
// 'admin' as a fallback until one is set up) -- enforced here, not just in
// the UI.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
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

    const supabase = getSupabaseClient();

    const accessError = await checkClassTeacherAccess(supabase, school.id, staffSession.role, staffSession.userId, studentId);
    if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

    // Fetched once: used both for the head-of-section comment permission
    // check below and to snapshot the student's class onto this term's
    // report card, so a printed history stays labeled correctly for old
    // terms even after the student later moves from Primary into Secondary.
    const { data: student } = await supabase
      .from('students')
      .select('class')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .maybeSingle();
    const section = student ? getClassSection(student.class) : null;

    // The head-of-section comment (Headmaster's for Primary, Principal's for
    // Secondary) belongs to that section's own admin once one exists for
    // this school; the unscoped 'admin' (proprietor) is a fallback only
    // until a headmaster/principal account is set up, and a class teacher
    // never gets to set it.
    if (principalComment !== undefined) {
      let allowed = false;
      if (staffSession.role === 'primary_admin' && section === 'Primary') allowed = true;
      else if (staffSession.role === 'secondary_admin' && section === 'Secondary') allowed = true;
      else if (staffSession.role === 'admin' && section) {
        allowed = !(await sectionHeadExists(supabase, school.id, SECTION_ADMIN_ROLE[section]));
      }

      if (!allowed) {
        const label = section === 'Secondary' ? "Principal's" : "Headmaster's";
        return NextResponse.json({ error: `Only the ${label} comment field can be set by that section's head.` }, { status: 403 });
      }
    }

    const { data: before } = await supabase
      .from('report_cards')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .eq('session', session)
      .eq('term', term)
      .maybeSingle();

    const update: ReportCardInsert = {
      school_id: school.id,
      student_id: studentId,
      session,
      term,
      class: student?.class ?? null,
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

    await logAudit({
      request,
      schoolId: school.id,
      actor: staffSession,
      action: publish === true ? 'report_card.publish' : publish === false ? 'report_card.unpublish' : 'report_card.save',
      entityType: 'report_card',
      entityId: data.id,
      before,
      after: data,
    });

    return NextResponse.json({ reportCard: data }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
