import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';
import { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerSession(token);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const body = await request.json();
    const update: SchoolUpdate = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.subdomain !== undefined) update.subdomain = body.subdomain;
    if (body.customDomain !== undefined) update.custom_domain = body.customDomain || null;
    if (body.idPrefix !== undefined) update.id_prefix = body.idPrefix;
    if (body.primaryColor !== undefined) update.primary_color = body.primaryColor || null;
    if (body.tagline !== undefined) update.tagline = body.tagline || null;
    if (body.heroImageUrl !== undefined) update.hero_image_url = body.heroImageUrl || null;
    if (body.whatsappNumber !== undefined) update.whatsapp_number = body.whatsappNumber || null;
    if (body.principalWelcomeMessage !== undefined)
      update.principal_welcome_message = body.principalWelcomeMessage || null;
    if (body.principalPhotoUrl !== undefined) update.principal_photo_url = body.principalPhotoUrl || null;
    if (body.prospectusUrl !== undefined) update.prospectus_url = body.prospectusUrl || null;
    if (body.status !== undefined) {
      if (!['Active', 'Suspended'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be Active or Suspended.' }, { status: 400 });
      }
      update.status = body.status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('schools').update(update).eq('id', id).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That subdomain or custom domain is already in use.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ school: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
