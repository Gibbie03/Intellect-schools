import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { verifyPassword, signSession, SESSION_COOKIE, signPendingTwoFactorToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = await checkRateLimit(`login:${ip}`, 10, 300);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }

    const supabase = getSupabaseClient();
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required.' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('school_users')
      .select('*')
      .eq('school_id', school.id)
      .eq('email', email)
      .eq('status', 'Active')
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.totp_enabled) {
      const pendingToken = await signPendingTwoFactorToken({ userId: user.id, schoolSubdomain: school.subdomain });
      return NextResponse.json({ requires2fa: true, pendingToken });
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
    return apiError(error);
  }
}
