import { NextRequest, NextResponse } from 'next/server';
import { getSchoolFromHost } from '@/lib/tenant';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const school = await getSchoolFromHost(request.headers.get('host'));
  if (!school || school.subdomain !== session.schoolSubdomain) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  return NextResponse.json({ role: session.role, fullName: session.fullName });
}
