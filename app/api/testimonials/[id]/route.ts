import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
