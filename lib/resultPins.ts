import { randomInt } from 'node:crypto';

/**
 * Generates a random numeric PIN as a string, matching the WAEC/NECO/JAMB
 * scratch-card convention parents already recognize.
 */
export function generatePin(length = 10): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += randomInt(0, 10).toString();
  }
  return pin;
}

/**
 * Builds a human-readable serial for one card in a batch, e.g.
 * "ICS-25T2-0007" -- school prefix + a short batch tag + a zero-padded
 * sequence number, so a printed sheet reads in order.
 */
export function buildSerial(idPrefix: string, batchTag: string, sequence: number): string {
  return `${idPrefix}-${batchTag}-${String(sequence).padStart(4, '0')}`;
}

const TERM_NUMBERS: Record<string, number> = {
  'first term': 1,
  'second term': 2,
  'third term': 3,
};

/**
 * Derives a short batch tag from a session + optional term, e.g. session
 * "2025/2026" + term "Second Term" -> "25T2". Falls back to the last two
 * digits of the current year if the session string doesn't parse.
 */
export function buildBatchTag(session: string, term?: string | null): string {
  const yearMatch = session.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1].slice(2) : String(new Date().getFullYear()).slice(2);
  const termNumber = term ? TERM_NUMBERS[term.trim().toLowerCase()] : undefined;
  return termNumber ? `${year}T${termNumber}` : year;
}
