import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { hashPassword, verifyOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerSession(token);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const { id, userId } = await params;
    const supabase = getSupabaseClient();
    const body = await request.json();

    // Lockout recovery: the platform owner can turn off a user's two-factor
    // authentication if they've lost their authenticator app/device -- there
    // are no backup codes, so this is the only way back in otherwise.
    if (body.disableTotp === true) {
      const { data, error } = await supabase
        .from('school_users')
        .update({ totp_secret: null, totp_enabled: false })
        .eq('id', userId)
        .eq('school_id', id)
        .select('id, email, role, full_name')
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }

    const { password } = body;
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'password must be at least 8 characters.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('school_users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)
      .eq('school_id', id)
      .select('id, email, role, full_name')
      .single();

    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
