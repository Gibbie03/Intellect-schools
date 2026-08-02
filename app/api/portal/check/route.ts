import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// The only public (unauthenticated) way to read a student's approved
// results: a scratch-card serial + PIN gates the lookup, matching the
// WAEC/NECO/JAMB result-checker model. /api/students and /api/results stay
// staff-only -- this route does its own scoped queries after the PIN is
// verified, rather than reusing those endpoints.
export async function POST(request: NextRequest) {
  try {
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

    if (card.uses_count >= card.max_uses) {
      return NextResponse.json(
        { error: 'This card has already been used its maximum number of times. Please get a new card.' },
        { status: 403 }
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

    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('school_id', school.id)
      .eq('student_id', studentId)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });
    if (resultsError) throw resultsError;

    const { error: updateError } = await supabase
      .from('result_pins')
      .update({ uses_count: card.uses_count + 1 })
      .eq('id', card.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      student: { studentId: student.student_id, fullName: student.full_name, class: student.class },
      results,
      usesRemaining: card.max_uses - (card.uses_count + 1),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
