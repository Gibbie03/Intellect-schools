import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { CLASSES, getSectionClasses } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// Bulk-moves every Active student in one class to another (next-session
// rollover), or marks the whole class as graduated (Inactive) instead of
// moving them -- e.g. promoting the final class out of the school.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { fromClass, toClass, graduate } = await request.json();
    const sectionClasses = getSectionClasses(session.role);

    if (!fromClass || !CLASSES.includes(fromClass)) {
      return NextResponse.json({ error: 'A valid fromClass is required.' }, { status: 400 });
    }
    if (sectionClasses && !sectionClasses.includes(fromClass)) {
      return NextResponse.json({ error: 'You do not have access to promote that class.' }, { status: 403 });
    }
    if (!graduate) {
      if (!toClass || !CLASSES.includes(toClass)) {
        return NextResponse.json({ error: 'A valid toClass is required, unless graduating the class.' }, { status: 400 });
      }
      if (toClass === fromClass) {
        return NextResponse.json({ error: 'toClass must be different from fromClass.' }, { status: 400 });
      }
      if (sectionClasses && !sectionClasses.includes(toClass)) {
        return NextResponse.json({ error: 'You do not have access to promote students into that class.' }, { status: 403 });
      }
    }

    const supabase = getSupabaseClient();
    const update = graduate ? { status: 'Inactive' as const } : { class: toClass };

    const { data, error } = await supabase
      .from('students')
      .update(update)
      .eq('school_id', school.id)
      .eq('class', fromClass)
      .eq('status', 'Active')
      .select('id');
    if (error) throw error;

    return NextResponse.json({ promoted: data?.length ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
