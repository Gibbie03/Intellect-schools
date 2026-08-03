import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'code is required.' }, { status: 400 });

    const supabase = getSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from('school_users')
      .select('totp_secret')
      .eq('id', session.userId)
      .eq('school_id', school.id)
      .single();
    if (userError) throw userError;
    if (!user.totp_secret) {
      return NextResponse.json({ error: 'Start setup first.' }, { status: 400 });
    }

    const result = verifyTotpCode(user.totp_secret, code);
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid code. Check your authenticator app and try again.' }, { status: 400 });
    }

    // Seed totp_last_used_step with the step that just confirmed setup, so
    // this same code can't immediately be replayed against the first real
    // login (see verify-2fa's replay-protection check).
    const { error } = await supabase
      .from('school_users')
      .update({ totp_enabled: true, totp_last_used_step: result.step })
      .eq('id', session.userId)
      .eq('school_id', school.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
