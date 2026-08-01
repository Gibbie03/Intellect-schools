import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { STAFF_ROLES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ teachers: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { staffId, fullName, role, subject, email, phone } = await request.json();

    if (!staffId || !fullName) {
      return NextResponse.json({ error: 'staffId and fullName are required.' }, { status: 400 });
    }
    if (role && !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        staff_id: staffId,
        full_name: fullName,
        role: role || 'Teacher',
        subject: subject || null,
        email: email || null,
        phone: phone || null,
        status: 'Active',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `A staff member with ID "${staffId}" already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ teacher: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
