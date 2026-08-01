import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message are required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        school_id: school.id,
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: 'New',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
