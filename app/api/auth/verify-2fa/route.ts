import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { signSession, SESSION_COOKIE, verifyPendingTwoFactorToken } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = await checkRateLimit(`verify-2fa:${ip}`, 10, 300);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }

    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { pendingToken, code } = await request.json();
    if (!pendingToken || !code) {
      return NextResponse.json({ error: 'pendingToken and code are required.' }, { status: 400 });
    }

    const pending = await verifyPendingTwoFactorToken(pendingToken);
    if (!pending || pending.schoolSubdomain !== school.subdomain) {
      return NextResponse.json({ error: 'Your session expired. Please log in again.' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('school_users')
      .select('*')
      .eq('id', pending.userId)
      .eq('school_id', school.id)
      .eq('status', 'Active')
      .maybeSingle();
    if (error) throw error;
    if (!user || !user.totp_enabled || !user.totp_secret) {
      return NextResponse.json({ error: 'Your session expired. Please log in again.' }, { status: 401 });
    }

    if (!verifyTotpCode(user.totp_secret, code)) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      role: user.role,
      schoolSubdomain: school.subdomain,
      fullName: user.full_name,
    });

    const response = NextResponse.json({ role: user.role, fullName: user.full_name });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
