import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;
    const { error } = await supabase.from('news_events').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
