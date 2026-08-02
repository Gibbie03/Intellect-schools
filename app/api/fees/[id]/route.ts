import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type FeeUpdate = Database['public']['Tables']['fees']['Update'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { id } = await params;
    const body = await request.json();
    const update: FeeUpdate = {};

    if (body.status !== undefined) {
      if (!['Unpaid', 'Paid'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Unpaid or Paid.' }, { status: 400 });
      }
      update.status = body.status;
    }
    if (body.reminded === true) {
      update.last_reminded_at = new Date().toISOString();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fees')
      .update(update)
      .eq('id', id)
      .eq('school_id', school.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ fee: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('fees').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
