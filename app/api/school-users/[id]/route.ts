import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { hashPassword, verifySession, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireSchoolAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session || session.role !== 'admin') return null;

  const school = await getSchoolFromHost(request.headers.get('host'));
  if (!school || school.subdomain !== session.schoolSubdomain) return null;

  return school;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const school = await requireSchoolAdmin(request);
  if (!school) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const body = await request.json();

    if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length < 8) {
        return NextResponse.json({ error: 'password must be at least 8 characters.' }, { status: 400 });
      }

      const passwordHash = await hashPassword(body.password);
      const { data, error } = await supabase
        .from('school_users')
        .update({ password_hash: passwordHash })
        .eq('id', id)
        .eq('school_id', school.id)
        .select('id, email, role, full_name, status')
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }

    if (body.status !== undefined) {
      if (!['Active', 'Inactive'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Active or Inactive.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('school_users')
        .update({ status: body.status })
        .eq('id', id)
        .eq('school_id', school.id)
        .select('id, email, role, full_name, status')
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }

    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
