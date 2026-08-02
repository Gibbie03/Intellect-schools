import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { CLASSES, DEPARTMENTS, isSeniorSecondaryClass } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// FIX NOTE: previously this had no session check at all -- any request with a
// resolvable Host header (no cookie needed) could list the school's entire
// student roster, including parent email/phone/address/DOB. A studentId
// lookup used to be left open for app/portal's benefit; that public path now
// goes through /api/portal/check instead (gated by a scratch-card PIN), so
// this route is staff-only across the board.
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();

    const className = request.nextUrl.searchParams.get('class');
    const status = request.nextUrl.searchParams.get('status') as 'Active' | 'Inactive' | null;
    const studentId = request.nextUrl.searchParams.get('studentId');

    let query = supabase.from('students').select('*').eq('school_id', school.id).order('full_name', { ascending: true });
    if (className) query = query.eq('class', className);
    if (status) query = query.eq('status', status);
    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ students: data });
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
    const { studentId, fullName, className, department, gender, dateOfBirth, parentName, parentEmail, parentPhone, address } =
      await request.json();

    if (!studentId || !fullName || !className) {
      return NextResponse.json({ error: 'studentId, fullName, and className are required.' }, { status: 400 });
    }
    if (!CLASSES.includes(className)) {
      return NextResponse.json({ error: 'Invalid class.' }, { status: 400 });
    }
    if (department && !(DEPARTMENTS as readonly string[]).includes(department)) {
      return NextResponse.json({ error: 'Invalid department.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        school_id: school.id,
        student_id: studentId,
        full_name: fullName,
        class: className,
        department: isSeniorSecondaryClass(className) ? department || null : null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        parent_name: parentName || null,
        parent_email: parentEmail || null,
        parent_phone: parentPhone || null,
        address: address || null,
        status: 'Active',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `A student with ID "${studentId}" already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ student: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
