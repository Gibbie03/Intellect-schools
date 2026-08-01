import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export async function generateStudentId(supabase: SupabaseClient<Database>): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ICS/${year}/`;

  const { count, error } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .like('student_id', `${prefix}%`);

  if (error) throw error;

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}
