import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['General Enquiry', 'Suggestion', 'Complaint', 'Other'];

// FIX NOTE: GET (every contact-form submitter's name/email/phone/message)
// had no session check. POST (the public contact form) stays open.
export async function GET(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { name, email, phone, subject, message, category } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message are required.' }, { status: 400 });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${CATEGORIES.join(', ')}.` }, { status: 400 });
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
        category: category || 'General Enquiry',
        status: 'New',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
