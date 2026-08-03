import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// A full export of a school's own data -- proprietors own their records
// independent of their subscription with SchoolOS, so this deliberately
// covers every tenant-scoped table. Login credentials (school_users) and
// result-checker PIN hashes are excluded since they're secrets, not records
// the school needs a portable copy of.
const EXPORT_TABLES = [
  'students',
  'teachers',
  'results',
  'report_cards',
  'admissions',
  'news_events',
  'gallery_images',
  'contact_messages',
  'class_timetables',
  'exam_timetables',
  'fees',
  'expenses',
  'spotlights',
  'academic_calendar',
  'testimonials',
  'attendance',
  'audit_log',
] as const;

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();

    const results = await Promise.all(
      EXPORT_TABLES.map((table) => supabase.from(table).select('*').eq('school_id', school.id))
    );

    const data: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      school: { id: school.id, name: school.name, subdomain: school.subdomain },
    };

    EXPORT_TABLES.forEach((table, i) => {
      const { data: rows, error } = results[i];
      if (error) throw error;
      data[table] = rows;
    });

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${school.subdomain}-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
