import { getSupabaseClient } from './supabase';

/**
 * Resolves the class a teacher's login account is the class teacher for, if
 * any (null for subject teachers, unassigned teachers, and admins). Used to
 * gate report-card editing to the one teacher responsible for that class.
 */
export async function getClassTeacherAssignment(userId: string): Promise<string | null> {
  const supabase = getSupabaseClient();

  const { data: account } = await supabase
    .from('school_users')
    .select('teacher_id')
    .eq('id', userId)
    .maybeSingle();
  if (!account?.teacher_id) return null;

  const { data: teacher } = await supabase
    .from('teachers')
    .select('class_teacher_of')
    .eq('id', account.teacher_id)
    .maybeSingle();

  return teacher?.class_teacher_of ?? null;
}

/**
 * Resolves which subjects a teacher's login account is permitted to enter
 * results for, from the comma-separated `teachers.subject` field on their
 * linked staff profile (e.g. "Mathematics, Further Mathematics"). Returns
 * null when unrestricted -- either the account isn't linked to a staff
 * profile, or that profile's Subject field was left blank, which preserves
 * the original behavior of a class teacher owning every subject for their
 * class (the common case for Primary class teachers who teach everything).
 */
export async function getTeacherSubjects(userId: string): Promise<string[] | null> {
  const supabase = getSupabaseClient();

  const { data: account } = await supabase
    .from('school_users')
    .select('teacher_id')
    .eq('id', userId)
    .maybeSingle();
  if (!account?.teacher_id) return null;

  const { data: teacher } = await supabase
    .from('teachers')
    .select('subject')
    .eq('id', account.teacher_id)
    .maybeSingle();

  const subjects = (teacher?.subject ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return subjects.length > 0 ? subjects : null;
}
