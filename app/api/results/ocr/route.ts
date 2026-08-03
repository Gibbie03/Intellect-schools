import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { extractMarkSheet } from '@/lib/markSheetOcr';
import { getEffectiveClassScope } from '@/lib/sectionScope';
import { validateImageUpload } from '@/lib/imageUpload';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Reads a photo of a mark sheet with a vision model, then matches each
// extracted row to a known student in this school (by exact Student ID,
// then by exact full name) so a teacher can review/correct the match and
// the scores before anything is saved. Nothing here writes to `results` --
// the reviewed table is submitted separately via POST /api/results/batch.
export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const className = formData.get('className');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
    }
    const validation = validateImageUpload(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be smaller than 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedRows = await extractMarkSheet(buffer, file.type);

    const supabase = getSupabaseClient();
    let rosterQuery = supabase
      .from('students')
      .select('student_id, full_name')
      .eq('school_id', school.id)
      .eq('status', 'Active');
    if (typeof className === 'string' && className) rosterQuery = rosterQuery.eq('class', className);

    const sectionClasses = await getEffectiveClassScope(session.role, session.userId);
    if (sectionClasses) rosterQuery = rosterQuery.in('class', sectionClasses.length > 0 ? sectionClasses : ['__none__']);

    const { data: roster, error: rosterError } = await rosterQuery;
    if (rosterError) throw rosterError;

    const rows = extractedRows.map((row) => {
      const normalizedLabel = row.label.trim().toLowerCase();
      const byId = roster?.find((s) => s.student_id.toLowerCase() === normalizedLabel);
      const byName = !byId ? roster?.find((s) => s.full_name.trim().toLowerCase() === normalizedLabel) : null;
      const matched = byId ?? byName ?? null;

      return {
        label: row.label,
        score: row.score,
        caScore: row.caScore,
        examScore: row.examScore,
        matchedStudentId: matched?.student_id ?? null,
        matchedStudentName: matched?.full_name ?? null,
      };
    });

    return NextResponse.json({ rows, roster });
  } catch (error) {
    return apiError(error);
  }
}
