import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// FIX NOTE: GET (the full applicant list, with parent name/email/phone/
// address) had no session check -- POST (the public application form) is
// meant to be open, but listing every applicant is admin-only data and now
// requires an admin session.
export async function GET(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ admissions: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const body = await request.json();
    const {
      studentName,
      dateOfBirth,
      gender,
      classApplyingFor,
      parentName,
      parentEmail,
      parentPhone,
      address,
      notes,
    } = body;

    if (!studentName || !classApplyingFor || !parentName || !parentEmail || !parentPhone) {
      return NextResponse.json(
        { error: 'studentName, classApplyingFor, parentName, parentEmail, and parentPhone are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('admissions')
      .insert({
        school_id: school.id,
        student_name: studentName,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        class_applying_for: classApplyingFor,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        address: address || null,
        notes: notes || null,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ admission: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
