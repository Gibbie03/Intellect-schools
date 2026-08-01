import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { hashPassword, verifyOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerSession(token);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'email, password, and fullName are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'password must be at least 8 characters.' }, { status: 400 });
    }

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', id)
      .single();
    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found.' }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('school_users')
      .insert({
        school_id: school.id,
        email,
        password_hash: passwordHash,
        role: role === 'teacher' ? 'teacher' : 'admin',
        full_name: fullName,
      })
      .select('id, email, role, full_name')
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
