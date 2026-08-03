import { getSupabaseClient } from './supabase';
import { getSectionClasses } from './constants';

type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// results/report_cards/fees/attendance are keyed by student_id (a string),
// not class, so scoping a section-restricted admin's access to them needs a
// join through `students` first. Returns null for unrestricted roles (the
// plain 'admin', or 'teacher') -- callers should skip filtering entirely in
// that case, same convention as getSectionClasses.
export async function getSectionStudentIds(
  supabase: SupabaseClient,
  schoolId: string,
  role: string
): Promise<string[] | null> {
  const sectionClasses = getSectionClasses(role);
  if (!sectionClasses) return null;

  const { data } = await supabase.from('students').select('student_id').eq('school_id', schoolId).in('class', sectionClasses);
  return (data ?? []).map((s) => s.student_id);
}

// For single-record writes keyed by a studentId already in the request body
// (a new result, fee, or attendance entry) -- true if the role is
// unrestricted, or the student's current class falls in that role's section.
export async function isStudentInSection(
  supabase: SupabaseClient,
  schoolId: string,
  role: string,
  studentId: string
): Promise<boolean> {
  const sectionClasses = getSectionClasses(role);
  if (!sectionClasses) return true;

  const { data } = await supabase
    .from('students')
    .select('class')
    .eq('school_id', schoolId)
    .eq('student_id', studentId)
    .maybeSingle();
  return !!data && sectionClasses.includes(data.class);
}
