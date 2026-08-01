import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const { status } = await request.json();

    if (!['New', 'Read'].includes(status)) {
      return NextResponse.json({ error: 'status must be New or Read.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
