import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { signOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = await checkRateLimit(`platform-login:${ip}`, 5, 300);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }

    const ownerPassword = process.env.PLATFORM_OWNER_PASSWORD;
    if (!ownerPassword) {
      return NextResponse.json({ error: 'Platform owner password is not configured.' }, { status: 500 });
    }

    const { password } = await request.json();
    if (!password || typeof password !== 'string' || !safeEqual(password, ownerPassword)) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    const token = await signOwnerSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(PLATFORM_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
