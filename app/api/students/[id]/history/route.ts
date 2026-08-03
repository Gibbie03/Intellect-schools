import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { getEffectiveClassScope } from '@/lib/sectionScope';

export const dynamic = 'force-dynamic';

// A student's full academic history, from their first published term
// through their most recent one -- the same "official record" view a
// parent sees on the portal (Approved results in Published-report-card
// terms only), but reachable by staff without needing a still-valid PIN
// card. Useful once a student is close to or past graduation.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin', 'teacher']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school, session } = staff;

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('school_id', school.id)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

    const sectionClasses = await getEffectiveClassScope(session.role, session.userId);
    if (sectionClasses && !sectionClasses.includes(student.class)) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const { data: allResults, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', student.student_id)
      .eq('status', 'Approved');
    if (resultsError) throw resultsError;

    const { data: allReportCards, error: reportCardsError } = await supabase
      .from('report_cards')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', student.student_id);
    if (reportCardsError) throw reportCardsError;

    const publishedReportCards = (allReportCards ?? []).filter((rc) => rc.status === 'Published');
    const publishedTerms = new Set(publishedReportCards.map((rc) => `${rc.session}|${rc.term}`));
    const results = (allResults ?? []).filter((r) => publishedTerms.has(`${r.session}|${r.term}`));

    return NextResponse.json({
      student: {
        studentId: student.student_id,
        fullName: student.full_name,
        class: student.class,
        department: student.department,
        campus: student.campus,
      },
      results,
      reportCards: publishedReportCards,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
