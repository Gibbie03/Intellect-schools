import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const EVENT_TYPES = ['Resumption', 'Midterm Break', 'Closing', 'Holiday', 'Other'];

// Public read -- term dates and holidays aren't sensitive and parents/
// students should see them without logging in.
export async function GET(request: NextRequest) {
  try {
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const session = request.nextUrl.searchParams.get('session');
    if (!session) {
      return NextResponse.json({ error: 'session is required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('academic_calendar')
      .select('*')
      .eq('school_id', school.id)
      .eq('session', session)
      .order('start_date', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { session, term, title, eventType, startDate, endDate } = await request.json();
    if (!session || !title || !eventType || !startDate) {
      return NextResponse.json({ error: 'session, title, eventType, and startDate are required.' }, { status: 400 });
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: `eventType must be one of: ${EVENT_TYPES.join(', ')}.` }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('academic_calendar')
      .insert({
        school_id: school.id,
        session,
        term: term || null,
        title,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate || null,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
