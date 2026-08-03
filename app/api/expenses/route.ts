import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');

    const supabase = getSupabaseClient();
    let query = supabase.from('expenses').select('*').eq('school_id', school.id).order('expense_date', { ascending: false });
    if (session) query = query.eq('session', session);
    if (term) query = query.eq('term', term);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ expenses: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const { session, term, category, description, amount, expenseDate } = await request.json();
    if (!session || !term || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'session, term, and amount are required.' }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        school_id: school.id,
        session,
        term,
        category: category || 'General',
        description: description || null,
        amount: numericAmount,
        expense_date: expenseDate || new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ expense: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
