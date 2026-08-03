import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Public "Meet the Teachers" page -- only Teacher/Head Teacher roles that an
// admin has opted in to showing (show_on_site), and only while employed.
export async function GET(request: NextRequest) {
  try {
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teachers')
      .select('id, full_name, role, subject, photo_url, bio')
      .eq('school_id', school.id)
      .eq('status', 'Active')
      .eq('show_on_site', true)
      .in('role', ['Teacher', 'Head Teacher'])
      .order('full_name', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ staff: data });
  } catch (error) {
    return apiError(error);
  }
}
