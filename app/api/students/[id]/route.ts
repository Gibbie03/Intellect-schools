import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type StudentUpdate = Database['public']['Tables']['students']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const update: StudentUpdate = {};

    if (body.status !== undefined) {
      if (!['Active', 'Inactive'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Active or Inactive.' }, { status: 400 });
      }
      update.status = body.status as StudentUpdate['status'];
    }

    if (body.className !== undefined) {
      update.class = body.className;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .update(update)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ student: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
