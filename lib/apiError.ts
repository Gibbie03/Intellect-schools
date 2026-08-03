import { NextResponse } from 'next/server';

// An unhandled error in a route's outer catch block -- a raw Supabase/
// Postgres error, or anything else thrown that wasn't already turned into a
// friendly message -- may contain internal details (table/column names,
// constraint text, driver-specific wording) that shouldn't reach the
// browser. Log the real error server-side and return a generic message to
// the client instead.
export function apiError(error: unknown, status = 500) {
  console.error(error);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status });
}
