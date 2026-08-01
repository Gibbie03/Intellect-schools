import { NextRequest, NextResponse } from 'next/server';
import { verifySession, verifyOwnerSession, SESSION_COOKIE, PLATFORM_SESSION_COOKIE } from '@/lib/session';

export const config = {
  matcher: ['/admin/:path*', '/teacher-dashboard/:path*', '/platform/:path*'],
};

function extractSubdomain(host: string, rootDomain: string): string | null {
  const bareHost = host.split(':')[0];
  if (!bareHost.endsWith(`.${rootDomain}`)) return null;
  return bareHost.slice(0, -(rootDomain.length + 1));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/platform')) {
    if (path === '/platform/login') return NextResponse.next();

    const ownerToken = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
    const isOwner = ownerToken ? await verifyOwnerSession(ownerToken) : false;
    if (!isOwner) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a real root domain is configured, the session's schoolSubdomain claim
  // must match the current request's subdomain — blocks a token issued for
  // one school's subdomain from being replayed against another's. During
  // rollout (no root domain yet, single "intellect" tenant), this check is
  // skipped since there's nothing meaningful to compare against.
  const rootDomain = process.env.PLATFORM_ROOT_DOMAIN;
  if (rootDomain) {
    const host = request.headers.get('host') ?? '';
    const subdomain = extractSubdomain(host, rootDomain);
    if (!subdomain || subdomain !== session.schoolSubdomain) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (path.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
