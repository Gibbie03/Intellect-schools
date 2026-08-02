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
