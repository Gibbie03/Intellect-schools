import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getSectionClasses } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const sectionClasses = getSectionClasses(session.role);
    if (sectionClasses) {
      const { data: existing } = await supabase
        .from('class_subjects')
        .select('class')
        .eq('id', id)
        .eq('school_id', school.id)
        .maybeSingle();
      if (!existing || !sectionClasses.includes(existing.class)) {
        return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
      }
    }

    const { error } = await supabase.from('class_subjects').delete().eq('id', id).eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
