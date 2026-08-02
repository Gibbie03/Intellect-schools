import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Requires the current password again -- disabling 2FA lowers account
// security, so it shouldn't be doable from e.g. a hijacked, already-open
// browser tab without re-proving who you are.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: 'password is required.' }, { status: 400 });

    const supabase = getSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from('school_users')
      .select('password_hash')
      .eq('id', session.userId)
      .eq('school_id', school.id)
      .single();
    if (userError) throw userError;

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });

    const { error } = await supabase
      .from('school_users')
      .update({ totp_secret: null, totp_enabled: false })
      .eq('id', session.userId)
      .eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
