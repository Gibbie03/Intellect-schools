import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { gradeFromScore } from '@/lib/grade';
import { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type ResultInsert = Database['public']['Tables']['results']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { subject, session, term, uploadedBy, entries } = await request.json();

    if (!subject || !session || !term || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'subject, session, term, and a non-empty entries array are required.' },
        { status: 400 }
      );
    }

    const rows: ResultInsert[] = [];
    const errors: { studentId: string; reason: string }[] = [];

    for (const entry of entries) {
      const studentId = entry?.studentId;
      const score = Number(entry?.score);

      if (!studentId) {
        errors.push({ studentId: String(studentId ?? ''), reason: 'Missing student ID.' });
        continue;
      }
      if (Number.isNaN(score) || score < 0 || score > 100) {
        errors.push({ studentId, reason: 'Score must be a number between 0 and 100.' });
        continue;
      }

      rows.push({
        student_id: studentId,
        subject,
        score,
        grade: gradeFromScore(score),
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
