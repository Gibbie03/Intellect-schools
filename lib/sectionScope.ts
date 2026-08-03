import { getSupabaseClient } from './supabase';
import { getSectionClasses } from './constants';
import { getClassTeacherAssignment } from './classTeacher';

type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// The single source of truth for "which classes can this staff member touch"
// -- covers every restricted role, not just the section-admin ones.
// null = unrestricted (only the plain 'admin' role). primary_admin/
// secondary_admin get their section's class list. 'teacher' gets a
// single-class array from their class-teacher assignment, or an empty array
// if they aren't assigned as a class teacher at all (matches
// report-cards.ts/attendance.ts's existing "not assigned" behavior -- an
// empty array denies everything rather than silently meaning unrestricted).
//
// FIX NOTE: students/route.ts, results/route.ts, results/batch/route.ts,
// results/ocr/route.ts, students/[id]/history/route.ts, and fees/route.ts
// all allow the 'teacher' role but used to call getSectionClasses(role)
// directly (or the two helpers below, which called it internally) --
// getSectionClasses only special-cases primary_admin/secondary_admin and
// returns null (unrestricted) for anything else, including 'teacher'. That
// silently gave every teacher account read/write access to every class in
// the school, not just the one they're the class teacher for. Routing every
// caller through this function instead closes that for good, rather than
// patching each call site with its own copy of the same teacher lookup.
export async function getEffectiveClassScope(role: string, userId: string): Promise<string[] | null> {
  if (role === 'teacher') {
    const classTeacherOf = await getClassTeacherAssignment(userId);
    return classTeacherOf ? [classTeacherOf] : [];
  }
  return getSectionClasses(role);
}

// results/report_cards/fees/attendance are keyed by student_id (a string),
// not class, so scoping a restricted role's access to them needs a join
// through `students` first. Returns null for the unrestricted 'admin' role
// -- callers should skip filtering entirely in that case.
export async function getSectionStudentIds(
  supabase: SupabaseClient,
  schoolId: string,
  role: string,
  userId: string
): Promise<string[] | null> {
  const classes = await getEffectiveClassScope(role, userId);
  if (!classes) return null;
  if (classes.length === 0) return [];

  const { data } = await supabase.from('students').select('student_id').eq('school_id', schoolId).in('class', classes);
  return (data ?? []).map((s) => s.student_id);
}

// For single-record writes keyed by a studentId already in the request body
// (a new result, fee, or attendance entry) -- true if the role is
// unrestricted, or the student's current class falls within that role's
// allowed classes.
export async function isStudentInSection(
  supabase: SupabaseClient,
  schoolId: string,
  role: string,
  userId: string,
  studentId: string
): Promise<boolean> {
  const classes = await getEffectiveClassScope(role, userId);
  if (!classes) return true;
  if (classes.length === 0) return false;

  const { data } = await supabase
    .from('students')
    .select('class')
    .eq('school_id', schoolId)
    .eq('student_id', studentId)
    .maybeSingle();
  return !!data && classes.includes(data.class);
}

// Whether this school has an active headmaster/principal account for the
// given section -- used to decide whether the unscoped 'admin' (proprietor)
// can still fall back to writing the section's report-card comment, or
// whether that's now that section head's job.
export async function sectionHeadExists(
  supabase: SupabaseClient,
  schoolId: string,
  sectionRole: 'primary_admin' | 'secondary_admin'
): Promise<boolean> {
  const { data } = await supabase
    .from('school_users')
    .select('id')
    .eq('school_id', schoolId)
    .eq('role', sectionRole)
    .eq('status', 'Active')
    .limit(1);
  return (data?.length ?? 0) > 0;
}
