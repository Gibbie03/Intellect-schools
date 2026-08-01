import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateStudentId } from '@/lib/studentId';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const { status } = await request.json();

    if (!['Pending', 'Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;

    let issuedStudentId: string | null = null;

    if (status === 'Accepted' && !admission.student_id) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidateId = await generateStudentId(supabase);
        const { error: studentError } = await supabase.from('students').insert({
          student_id: candidateId,
          full_name: admission.student_name,
          class: admission.class_applying_for,
          gender: admission.gender,
          date_of_birth: admission.date_of_birth,
          parent_name: admission.parent_name,
          parent_email: admission.parent_email,
          parent_phone: admission.parent_phone,
          address: admission.address,
          status: 'Active',
        });

        if (!studentError) {
          issuedStudentId = candidateId;
          break;
        }
        if (studentError.code !== '23505') throw studentError;
      }

      if (!issuedStudentId) {
        return NextResponse.json({ error: 'Could not generate a unique Student ID. Try again.' }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from('admissions')
      .update(issuedStudentId ? { status, student_id: issuedStudentId } : { status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ admission: data, issuedStudentId });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
