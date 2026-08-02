import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// FIX NOTE: previously this had no session check at all -- any request with a
// resolvable Host header (no cookie needed) could list the school's entire
// student roster, including parent email/phone/address/DOB. The one
// legitimate unauthenticated use is app/portal (a parent looking up their
// own child by a known, specific studentId), so that single-record lookup
// stays open; anything broader (an unscoped list, or filtering by class/
// status the way the admin dashboard and teacher roster-loader do) now
// requires a staff session.
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const className = request.nextUrl.searchParams.get('class');
    const status = request.nextUrl.searchParams.get('status') as 'Active' | 'Inactive' | null;
    const studentId = request.nextUrl.searchParams.get('studentId');

    if (!studentId) {
      const staff = await requireSchoolSession(request, ['admin', 'teacher']);
      if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

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
    const { studentId, fullName, className, gender, dateOfBirth, parentName, parentEmail, parentPhone, address } =
      await request.json();

    if (!studentId || !fullName || !className) {
      return NextResponse.json({ error: 'studentId, fullName, and className are required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        school_id: school.id,
        student_id: studentId,
        full_name: fullName,
        class: className,
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
