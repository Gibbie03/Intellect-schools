import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

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
