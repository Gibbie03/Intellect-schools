import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BUCKET = 'gallery';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();

    const { data: image } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', params.id)
      .single();

    const { error } = await supabase.from('gallery_images').delete().eq('id', params.id);
    if (error) throw error;

    if (image?.image_url) {
      const marker = `/${BUCKET}/`;
      const idx = image.image_url.indexOf(marker);
      if (idx !== -1) {
        const path = image.image_url.slice(idx + marker.length);
        await supabase.storage.from(BUCKET).remove([path]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
