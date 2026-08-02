import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { generateTotpSecret, buildTotpQrCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

// Generates and stores a new secret, but does not enable 2FA yet -- that
// only happens once /api/auth/2fa/confirm proves the user can actually
// generate a valid code with it, so a broken authenticator-app scan never
// locks someone out of their own account.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const supabase = getSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from('school_users')
      .select('email')
      .eq('id', session.userId)
      .eq('school_id', school.id)
      .single();
    if (userError) throw userError;

    const secret = generateTotpSecret();
    const { error } = await supabase
      .from('school_users')
      .update({ totp_secret: secret, totp_enabled: false })
      .eq('id', session.userId)
      .eq('school_id', school.id);
    if (error) throw error;

    const qrCodeDataUrl = await buildTotpQrCode(secret, school.name, user.email);

    return NextResponse.json({ secret, qrCodeDataUrl });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
