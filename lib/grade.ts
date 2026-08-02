export function gradeFromScore(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

/**
 * Resolves a subject score from either a CA + Exam breakdown or a single
 * combined score -- teachers can enter either, and older/bulk-imported rows
 * may only ever have had the combined total. Returns null fields for
 * whichever breakdown wasn't provided, and throws with a user-facing
 * message if neither is usable.
 */
export function resolveScore(input: {
  score?: unknown;
  caScore?: unknown;
  examScore?: unknown;
}): { total: number; caScore: number | null; examScore: number | null } {
  const ca = input.caScore === undefined || input.caScore === null || input.caScore === '' ? null : Number(input.caScore);
  const exam = input.examScore === undefined || input.examScore === null || input.examScore === '' ? null : Number(input.examScore);

  // A teacher who has entered either a CA or an Exam figure (even just one
  // of the two, e.g. exams not sat yet) is using the breakdown -- the
  // missing half counts as 0 rather than falling back to the plain `score`
  // field, which is reserved for entries that never had a breakdown at all.
  if (ca !== null || exam !== null) {
    if ((ca !== null && (Number.isNaN(ca) || ca < 0)) || (exam !== null && (Number.isNaN(exam) || exam < 0))) {
      throw new Error('CA score and Exam score must be non-negative numbers.');
    }
    const total = (ca ?? 0) + (exam ?? 0);
    if (total > 100) throw new Error('CA score + Exam score cannot exceed 100.');
    return { total, caScore: ca, examScore: exam };
  }

  const total = Number(input.score);
  if (input.score === undefined || input.score === null || input.score === '' || Number.isNaN(total)) {
    throw new Error('Provide a score, or a CA score and/or an Exam score.');
  }
  if (total < 0 || total > 100) throw new Error('score must be a number between 0 and 100.');
  return { total, caScore: null, examScore: null };
}

export const SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Geography',
  'Economics',
  'Civic Education',
];

export const TERMS = ['First Term', 'Second Term', 'Third Term'];

export const SESSIONS = ['2024/2025', '2025/2026', '2026/2027'];

export const CURRENT_SESSION = '2025/2026';

export const CONDUCT_RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] as const;
