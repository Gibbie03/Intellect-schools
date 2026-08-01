import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { gradeFromScore } from '@/lib/grade';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const studentId = request.nextUrl.searchParams.get('studentId');
    const status = request.nextUrl.searchParams.get('status') as 'Pending' | 'Approved' | 'Rejected' | null;
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');

    let query = supabase.from('results').select('*').order('created_at', { ascending: false });
    if (studentId) query = query.eq('student_id', studentId);
    if (status) query = query.eq('status', status);
    if (session) query = query.eq('session', session);
    if (term) query = query.eq('term', term);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ results: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { studentId, subject, score, session, term, uploadedBy } = body;

    if (!studentId || !subject || score === undefined || score === null || !session || !term) {
      return NextResponse.json(
        { error: 'studentId, subject, score, session, and term are required.' },
        { status: 400 }
      );
    }

    const numericScore = Number(score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return NextResponse.json({ error: 'score must be a number between 0 and 100.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('results')
      .insert({
        student_id: studentId,
        subject,
        score: numericScore,
        grade: gradeFromScore(numericScore),
        session,
        term,
        status: 'Pending',
        uploaded_by: uploadedBy ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ result: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
