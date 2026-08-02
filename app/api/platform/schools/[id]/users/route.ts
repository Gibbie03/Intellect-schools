import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerSession(token);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('school_users')
      .select('id, email, role, full_name, status, totp_enabled, created_at')
      .eq('school_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
