import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// A session/term income vs. expense statement -- income is fees actually
// marked Paid (not amount invoiced), expenses is the manual ledger in
// `expenses`. This is a summary statement, not a full double-entry trial
// balance: there are no chart-of-accounts ledger entries behind it, just
// two totals compared.
export async function GET(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const session = request.nextUrl.searchParams.get('session');
    const term = request.nextUrl.searchParams.get('term');
    if (!session || !term) {
      return NextResponse.json({ error: 'session and term are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: paidFees, error: feesError } = await supabase
      .from('fees')
      .select('amount')
      .eq('school_id', school.id)
      .eq('session', session)
      .eq('term', term)
      .eq('status', 'Paid');
    if (feesError) throw feesError;

    const { data: expenseRows, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('school_id', school.id)
      .eq('session', session)
      .eq('term', term);
    if (expensesError) throw expensesError;

    const income = (paidFees ?? []).reduce((sum, f) => sum + Number(f.amount), 0);
    const expenseTotal = (expenseRows ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

    return NextResponse.json({ income, expenses: expenseTotal, net: income - expenseTotal });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
