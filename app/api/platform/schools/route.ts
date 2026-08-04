import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { hashPassword, verifyOwnerSession, PLATFORM_SESSION_COOKIE } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerSession(token);
}

export async function GET(request: NextRequest) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ schools: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireOwner(request))) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();
    const {
      name,
      subdomain,
      customDomain,
      idPrefix,
      primaryColor,
      secondaryColor,
      footerColor,
      tagline,
      motto,
      adminEmail,
      adminPassword,
      adminFullName,
    } = await request.json();

    if (!name || !subdomain || !customDomain || !idPrefix || !adminEmail || !adminPassword || !adminFullName) {
      return NextResponse.json(
        { error: 'name, subdomain, customDomain, idPrefix, adminEmail, adminPassword, and adminFullName are required.' },
        { status: 400 }
      );
    }

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name,
        subdomain,
        custom_domain: customDomain || null,
        id_prefix: idPrefix,
        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
        footer_color: footerColor || null,
        tagline: tagline || null,
        motto: motto || null,
      })
      .select()
      .single();

    if (schoolError) {
      if (schoolError.code === '23505') {
        return NextResponse.json({ error: 'That subdomain or custom domain is already in use.' }, { status: 409 });
      }
      throw schoolError;
    }

    const passwordHash = await hashPassword(adminPassword);
    const { error: userError } = await supabase.from('school_users').insert({
      school_id: school.id,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'admin',
      full_name: adminFullName,
    });

    if (userError) {
      await supabase.from('schools').delete().eq('id', school.id);
      throw userError;
    }

    return NextResponse.json({ school }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
