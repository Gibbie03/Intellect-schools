import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSupabaseClient } from '@/lib/supabase';
import { getSchoolFromHost } from '@/lib/tenant';
import { requireSchoolSession } from '@/lib/auth';
import { validateImageUpload } from '@/lib/imageUpload';

export const dynamic = 'force-dynamic';

const BUCKET = 'spotlights';

async function ensureBucketExists(supabase: ReturnType<typeof getSupabaseClient>) {
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const school = await getSchoolFromHost(request.headers.get('host'));
    if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('spotlights')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ spotlights: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireSchoolSession(request, ['admin']);
  if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { school } = staff;

  try {
    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const name = formData.get('name');
    const subtitle = formData.get('subtitle');
    const blurb = formData.get('blurb');
    const periodLabel = formData.get('periodLabel');
    const file = formData.get('file');

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
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
      .from('spotlights')
      .insert({
        school_id: school.id,
        name,
        subtitle: typeof subtitle === 'string' && subtitle ? subtitle : null,
        blurb: typeof blurb === 'string' && blurb ? blurb : null,
        period_label: typeof periodLabel === 'string' && periodLabel ? periodLabel : null,
        photo_url: photoUrl,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ spotlight: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
