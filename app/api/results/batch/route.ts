import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { gradeFromScore, resolveScore } from '@/lib/grade';
import { Database } from '@/lib/database.types';
import { requireSchoolSession } from '@/lib/auth';
import { getSectionStudentIds, isSubjectAllowedForTeacher } from '@/lib/sectionScope';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

type ResultInsert = Database['public']['Tables']['results']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session: staffSession } = staff;

    const supabase = getSupabaseClient();
    const { subject, session, term, uploadedBy, entries } = await request.json();

    if (!subject || !session || !term || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'subject, session, term, and a non-empty entries array are required.' },
        { status: 400 }
      );
    }

    if (!(await isSubjectAllowedForTeacher(staffSession.role, staffSession.userId, subject))) {
      return NextResponse.json({ error: 'You are not permitted to enter results for that subject.' }, { status: 403 });
    }

    const sectionStudentIds = await getSectionStudentIds(supabase, school.id, staffSession.role, staffSession.userId);
    const sectionSet = sectionStudentIds ? new Set(sectionStudentIds) : null;

    const rows: ResultInsert[] = [];
    const errors: { studentId: string; reason: string }[] = [];

    for (const entry of entries) {
      const studentId = entry?.studentId;

      if (!studentId) {
        errors.push({ studentId: String(studentId ?? ''), reason: 'Missing student ID.' });
        continue;
      }

      if (sectionSet && !sectionSet.has(studentId)) {
        errors.push({ studentId, reason: 'You do not have access to upload results for this student.' });
        continue;
      }

      let resolved;
      try {
        resolved = resolveScore({ score: entry?.score, caScore: entry?.caScore, examScore: entry?.examScore });
      } catch (err) {
        errors.push({ studentId, reason: (err as Error).message });
        continue;
      }

      rows.push({
        school_id: school.id,
        student_id: studentId,
        subject,
        score: resolved.total,
        ca_score: resolved.caScore,
        exam_score: resolved.examScore,
        grade: gradeFromScore(resolved.total),
        session,
        term,
        status: 'Approved',
        uploaded_by: uploadedBy ?? null,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid entries to upload.', errors }, { status: 400 });
    }

    const { data, error } = await supabase.from('results').insert(rows).select();
    if (error) throw error;

    return NextResponse.json({ created: data.length, skipped: errors.length, errors }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
