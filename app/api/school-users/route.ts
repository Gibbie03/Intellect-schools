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

export async function GET(request: NextRequest) {
  const school = await requireSchoolAdmin(request);
  if (!school) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('school_users')
      .select('id, email, role, full_name, teacher_id, status, created_at')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const school = await requireSchoolAdmin(request);
  if (!school) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const supabase = getSupabaseClient();
    const { email, password, fullName, role, teacherId } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'email, password, fullName, and role are required.' }, { status: 400 });
    }
    if (!['admin', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'role must be admin or teacher.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'password must be at least 8 characters.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('school_users')
      .insert({
        school_id: school.id,
        email,
        password_hash: passwordHash,
        role,
        full_name: fullName,
        teacher_id: teacherId || null,
      })
      .select('id, email, role, full_name, teacher_id, status, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `An account with email "${email}" already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
