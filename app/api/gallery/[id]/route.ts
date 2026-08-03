import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requireSchoolSession } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const BUCKET = 'gallery';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireSchoolSession(request, ['admin']);
    if (!staff) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { school } = staff;

    const supabase = getSupabaseClient();
    const { id } = await params;

    const { data: image } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .eq('school_id', school.id)
      .single();

    const { error } = await supabase.from('gallery_images').delete().eq('id', id).eq('school_id', school.id);
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
    return apiError(error);
  }
}
