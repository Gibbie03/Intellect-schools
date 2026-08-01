import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BUCKET = 'gallery';

async function ensureBucketExists(supabase: ReturnType<typeof getSupabaseClient>) {
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ images: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const caption = formData.get('caption');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    const MAX_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be smaller than 8MB.' }, { status: 400 });
    }

    await ensureBucketExists(supabase);

    const extension = file.name.includes('.') ? file.name.split('.').pop() : file.type.split('/')[1];
    const path = `${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), { contentType: file.type });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({ image_url: publicUrl, caption: typeof caption === 'string' && caption ? caption : null })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
