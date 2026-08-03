import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSupabaseClient } from '@/lib/supabase';
import { STAFF_ROLES, CLASSES, getSectionClasses } from '@/lib/constants';
import { requireSchoolSession } from '@/lib/auth';
import { validateImageUpload } from '@/lib/imageUpload';

export const dynamic = 'force-dynamic';

const BUCKET = 'teachers';

async function ensureBucketExists(supabase: ReturnType<typeof getSupabaseClient>) {
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Staff whose class_teacher_of isn't set (Head Teacher, Bursar, admin,
    // non-teaching staff, or a subject teacher not tied to one class) aren't
    // attributable to a single section, so they stay visible to both --
    // only a specific class assignment outside the admin's section is hidden.
    const sectionClasses = getSectionClasses(session.role);
    const teachers = sectionClasses
      ? (data ?? []).filter((t) => !t.class_teacher_of || sectionClasses.includes(t.class_teacher_of))
      : data;

    return NextResponse.json({ teachers });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Photo is a file upload only (taken/picked on the admin's device) -- no
// URL field, so staff creation doesn't depend on someone already having a
// hosted image link.
export async function POST(request: NextRequest) {
  try {
    const staff = await requireSchoolSession(request, ['admin', 'primary_admin', 'secondary_admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school, session } = staff;

    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const staffId = formData.get('staffId');
    const fullName = formData.get('fullName');
    const role = formData.get('role');
    const campus = formData.get('campus');
    const subject = formData.get('subject');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const classTeacherOf = formData.get('classTeacherOf');
    const bio = formData.get('bio');
    const file = formData.get('file');

    if (!staffId || typeof staffId !== 'string' || !fullName || typeof fullName !== 'string') {
      return NextResponse.json({ error: 'staffId and fullName are required.' }, { status: 400 });
    }
    if (role && (typeof role !== 'string' || !(STAFF_ROLES as readonly string[]).includes(role))) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }
    if (classTeacherOf && (typeof classTeacherOf !== 'string' || !CLASSES.includes(classTeacherOf))) {
      return NextResponse.json({ error: 'Invalid class for Class Teacher Of.' }, { status: 400 });
    }
    const sectionClasses = getSectionClasses(session.role);
    if (sectionClasses && classTeacherOf && !sectionClasses.includes(classTeacherOf as string)) {
      return NextResponse.json({ error: 'You do not have access to assign a class teacher for that class.' }, { status: 403 });
    }

    let photoUrl: string | null = null;
    if (file && typeof file !== 'string') {
      const validation = validateImageUpload(file);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      const MAX_BYTES = 8 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Image must be smaller than 8MB.' }, { status: 400 });
      }
      await ensureBucketExists(supabase);
      const path = `${school.id}/${randomUUID()}.${validation.extension}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, await file.arrayBuffer(), { contentType: file.type });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      photoUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        school_id: school.id,
        staff_id: staffId,
        full_name: fullName,
        role: ((role as string) || 'Teacher') as (typeof STAFF_ROLES)[number],
        campus: (campus as string) || null,
        subject: (subject as string) || null,
        email: (email as string) || null,
        phone: (phone as string) || null,
        status: 'Active',
        class_teacher_of: (classTeacherOf as string) || null,
        photo_url: photoUrl,
        bio: (bio as string) || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `A staff member with ID "${staffId}" already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ teacher: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
