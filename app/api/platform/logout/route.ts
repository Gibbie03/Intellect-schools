import { NextResponse } from 'next/server';
import { PLATFORM_SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PLATFORM_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
