import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const className = request.nextUrl.searchParams.get('class');
    const status = request.nextUrl.searchParams.get('status') as 'Active' | 'Inactive' | null;
    const studentId = request.nextUrl.searchParams.get('studentId');

    let query = supabase.from('students').select('*').order('full_name', { ascending: true });
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
    const supabase = getSupabaseClient();
    const { studentId, fullName, className, gender, dateOfBirth, parentName, parentEmail, parentPhone, address } =
      await request.json();

    if (!studentId || !fullName || !className) {
      return NextResponse.json({ error: 'studentId, fullName, and className are required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
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
