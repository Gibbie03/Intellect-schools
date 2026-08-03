import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getEffectiveClassScope, isStudentInSection } from '@/lib/sectionScope';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Lists fee records for a class/session/term, joined (in application code,
// not a DB join, since student_id here is a plain matching column rather
// than a foreign key) with each student's name and parent phone so the
// admin can generate a WhatsApp reminder link without a second request.
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const className = request.nextUrl.searchParams.get('class');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    const studentId = request.nextUrl.searchParams.get('studentId');

    const supabase = getSupabaseClient();

    if (studentId) {
      if (!(await isStudentInSection(supabase, school.id, staffSession.role, staffSession.userId, studentId))) {
        return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
      }
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('school_id', school.id)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ fees: data });
    }

    if (!className || !session || !term) {
      return NextResponse.json({ error: 'Provide either studentId, or class + session + term.' }, { status: 400 });
    }

    const allowedClasses = await getEffectiveClassScope(staffSession.role, staffSession.userId);
    if (allowedClasses && !allowedClasses.includes(className)) {
      return NextResponse.json({ error: 'You do not have access to that class.' }, { status: 403 });
    }

    const { data: roster, error: rosterError } = await supabase
      .from('students')
      .select('student_id, full_name, parent_name, parent_phone')
      .eq('school_id', school.id)
      .eq('class', className)
      .eq('status', 'Active');
    if (rosterError) throw rosterError;

    const studentIds = (roster ?? []).map((s) => s.student_id);
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', school.id)
      .eq('session', session)
      .eq('term', term)
      .in('student_id', studentIds.length > 0 ? studentIds : ['__none__']);
    if (feesError) throw feesError;

    const rosterById = new Map((roster ?? []).map((s) => [s.student_id, s]));
    const enriched = (fees ?? []).map((f) => ({ ...f, student: rosterById.get(f.student_id) ?? null }));

    return NextResponse.json({ fees: enriched, roster });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session: staffSession } = staff;

  try {
    const { studentId, session, term, description, amount, dueDate } = await request.json();
    if (!studentId || !session || !term || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'studentId, session, term, and amount are required.' }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    if (!(await isStudentInSection(supabase, school.id, staffSession.role, staffSession.userId, studentId))) {
      return NextResponse.json({ error: 'You do not have access to create fee records for that student.' }, { status: 403 });
    }
    const { data, error } = await supabase
      .from('fees')
      .insert({
        school_id: school.id,
        student_id: studentId,
        session,
        term,
        description: description || 'School Fees',
        amount: numericAmount,
        due_date: dueDate || null,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ fee: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
