import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { verifyPassword } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// The only public (unauthenticated) way to read a student's approved
// results: a scratch-card serial + PIN gates the lookup, matching the
// WAEC/NECO/JAMB result-checker model. /api/students and /api/results stay
// staff-only -- this route does its own scoped queries after the PIN is
// verified, rather than reusing those endpoints.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = await checkRateLimit(`portal-check:${ip}`, 20, 300);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a few minutes and try again.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }

    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const { studentId, serial, pin } = await request.json();
    if (!studentId || !serial || !pin) {
      return NextResponse.json({ error: 'Student ID, Serial, and PIN are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: card, error: cardError } = await supabase
      .from('result_pins')
      .select('*')
      .eq('school_id', school.id)
      .eq('serial', serial.trim().toUpperCase())
      .maybeSingle();
    if (cardError) throw cardError;

    const genericError = 'Invalid Student ID, Serial Number, or PIN.';
    if (!card) return NextResponse.json({ error: genericError }, { status: 401 });

    const pinValid = await verifyPassword(pin, card.pin_hash);
    if (!pinValid) return NextResponse.json({ error: genericError }, { status: 401 });

    // FIX NOTE: this used to read `card.uses_count`, compare it to
    // `max_uses`, and only afterwards write back `uses_count + 1` -- a
    // classic TOCTOU race. Two requests racing the same serial+PIN (a
    // shared/photographed scratch card is the realistic case, no attacker
    // sophistication required) could both read the same `uses_count`, both
    // pass the `>= max_uses` check, and both then write `uses_count + 1`,
    // letting the card be used more times than printed. The compare-and-swap
    // below closes it: the UPDATE's WHERE clause is evaluated against the
    // row's *current* value at write time, not our stale in-memory `card`,
    // so only one of two concurrent requests can ever win a given slot;
    // Postgres serializes the row-level UPDATEs, so the loser's WHERE
    // simply stops matching once the winner commits.
    let usesCount = card.uses_count;
    const cardId = card.id;
    let claimed = false;
    for (let attempt = 0; attempt < 3 && !claimed; attempt++) {
      if (usesCount >= card.max_uses) {
        return NextResponse.json(
          { error: 'This card has already been used its maximum number of times. Please get a new card.' },
          { status: 403 }
        );
      }

      const { data: updated, error: casError } = await supabase
        .from('result_pins')
        .update({ uses_count: usesCount + 1 })
        .eq('id', cardId)
        .eq('uses_count', usesCount)
        .select('uses_count')
        .maybeSingle();
      if (casError) throw casError;

      if (updated) {
        claimed = true;
        usesCount = updated.uses_count;
      } else {
        const { data: fresh, error: refetchError } = await supabase
          .from('result_pins')
          .select('uses_count')
          .eq('id', cardId)
          .single();
        if (refetchError) throw refetchError;
        usesCount = fresh.uses_count;
      }
    }

    if (!claimed) {
      return NextResponse.json(
        { error: 'This card is being used elsewhere right now. Please try again in a moment.' },
        { status: 409 }
      );
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student) return NextResponse.json({ error: genericError }, { status: 401 });

    const { data: allResults, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });
    if (resultsError) throw resultsError;

    const { data: allReportCards, error: reportCardsError } = await supabase
      .from('report_cards')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId);
    if (reportCardsError) throw reportCardsError;

    // A term's results are only visible on the portal once the class
    // teacher has compiled and published that term's report card --
    // uploading a score makes it "Approved" immediately (no admin
    // bottleneck), but publishing the report card is the parent-facing
    // release gate.
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
      usesRemaining: card.max_uses - usesCount,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
