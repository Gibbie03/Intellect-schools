import { NextRequest, NextResponse } from 'next/server';
import { getSchoolFromHost } from '@/lib/tenant';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import { getClassTeacherAssignment, getTeacherSubjects } from '@/lib/classTeacher';
import { getSupabaseClient } from '@/lib/supabase';

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

  const classTeacherOf = session.role === 'teacher' ? await getClassTeacherAssignment(session.userId) : null;
  const allowedSubjects = session.role === 'teacher' ? await getTeacherSubjects(session.userId) : null;

  const supabase = getSupabaseClient();
  const { data: user } = await supabase
    .from('school_users')
    .select('totp_enabled')
    .eq('id', session.userId)
    .eq('school_id', school.id)
    .maybeSingle();

  const campuses = (school.campuses ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  return NextResponse.json({
    role: session.role,
    fullName: session.fullName,
    classTeacherOf,
    allowedSubjects,
    totpEnabled: user?.totp_enabled ?? false,
    campuses,
  });
}
