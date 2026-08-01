import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
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
