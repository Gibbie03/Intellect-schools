export function gradeFromScore(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  return 'F';
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
