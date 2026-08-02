import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const { status } = await request.json();

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return NextResponse.json({ error: 'status must be Approved, Rejected, or Pending.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('results')
      .update({ status })
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ result: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
