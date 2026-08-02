import { NextRequest, NextResponse } from 'next/server';
import { getSchoolFromHost } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const school = await getSchoolFromHost(request.headers.get('host'));
  if (!school) return NextResponse.json({ error: 'School not found for this domain.' }, { status: 404 });

  return NextResponse.json({
    name: school.name,
    primaryColor: school.primary_color,
    tagline: school.tagline,
    heroImageUrl: school.hero_image_url,
  });
}
