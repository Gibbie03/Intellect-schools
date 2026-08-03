import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession, hashPassword } from '@/lib/auth';
import { generatePin, buildSerial, buildBatchTag } from '@/lib/resultPins';
import { logAudit } from '@/lib/auditLog';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Batch summary (never returns the individual PINs -- those are hashed and
// only ever shown once, in the POST response right after generation).
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('result_pins')
      .select('batch_label, session, term, delivery_method, max_uses, uses_count, created_at')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const batches = new Map<
      string,
      { batchLabel: string; session: string; term: string | null; deliveryMethod: string; maxUses: number; createdAt: string; total: number; exhausted: number }
    >();
    for (const row of data ?? []) {
      const existing = batches.get(row.batch_label);
      const isExhausted = row.uses_count >= row.max_uses;
      if (existing) {
        existing.total += 1;
        if (isExhausted) existing.exhausted += 1;
      } else {
        batches.set(row.batch_label, {
          batchLabel: row.batch_label,
          session: row.session,
          term: row.term,
          deliveryMethod: row.delivery_method,
          maxUses: row.max_uses,
          createdAt: row.created_at,
          total: 1,
          exhausted: isExhausted ? 1 : 0,
        });
      }
    }

    return NextResponse.json({ batches: Array.from(batches.values()) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { count, session, term, maxUses, deliveryMethod, batchLabel } = await request.json();

    const quantity = Number(count);
    if (!session || !quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json({ error: 'session and count (1-1000) are required.' }, { status: 400 });
    }
    const uses = Number(maxUses) > 0 ? Number(maxUses) : 3;
    const delivery = deliveryMethod === 'digital' ? 'digital' : 'print';
    const label = batchLabel || `${session}${term ? ` ${term}` : ''}`;

    const supabase = getSupabaseClient();
    const batchTag = buildBatchTag(session, term);

    // Sequence numbers continue from any prior cards using the same batch
    // tag for this school, so re-running a generation for the same
    // session/term doesn't collide on the unique (school_id, serial).
    const { count: existingCount, error: countError } = await supabase
      .from('result_pins')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .like('serial', `${school.id_prefix}-${batchTag}-%`);
    if (countError) throw countError;

    const startSequence = (existingCount ?? 0) + 1;
    const cards: { serial: string; pin: string }[] = [];
    const rows: {
      school_id: string;
      batch_label: string;
      serial: string;
      pin_hash: string;
      session: string;
      term: string | null;
      delivery_method: 'print' | 'digital';
      max_uses: number;
    }[] = [];

    for (let i = 0; i < quantity; i++) {
      const serial = buildSerial(school.id_prefix, batchTag, startSequence + i);
      const pin = generatePin();
      cards.push({ serial, pin });
      rows.push({
        school_id: school.id,
        batch_label: label,
        serial,
        pin_hash: await hashPassword(pin),
        session,
        term: term || null,
        delivery_method: delivery,
        max_uses: uses,
      });
    }

    const { error: insertError } = await supabase.from('result_pins').insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ batchLabel: label, cards }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

// Removes every card in a batch. PINs are bcrypt-hashed and shown only once
// at generation time -- there is no way to recover them afterwards, so this
// is for clearing out a batch whose codes were lost before being
// distributed (e.g. a "digital" batch never sent to parents), not for
// revoking cards already in parents' hands.
export async function DELETE(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const batchLabel = request.nextUrl.searchParams.get('batchLabel');
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    if (!batchLabel || !session) {
      return NextResponse.json({ error: 'batchLabel and session are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    let query = supabase
      .from('result_pins')
      .delete()
      .eq('school_id', school.id)
      .eq('batch_label', batchLabel)
      .eq('session', session)
      .select('id');
    query = term ? query.eq('term', term) : query.is('term', null);

    const { data, error } = await query;
    if (error) throw error;

    await logAudit({
      request,
      schoolId: school.id,
      actor: staff.session,
      action: 'result_pin_batch.delete',
      entityType: 'result_pin_batch',
      entityId: batchLabel,
      before: { batchLabel, session, term, cardsDeleted: data?.length ?? 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
