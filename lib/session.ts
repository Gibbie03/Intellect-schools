import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { getSchoolFromHost } from './tenant';
import type { Database } from './database.types';

export const SESSION_COOKIE = 'session';
export const PLATFORM_SESSION_COOKIE = 'platform_session';

type School = Database['public']['Tables']['schools']['Row'];

export type SessionPayload = {
  userId: string;
  role: 'admin' | 'primary_admin' | 'secondary_admin' | 'teacher';
  schoolSubdomain: string;
  fullName: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === 'string' &&
      (payload.role === 'admin' || payload.role === 'primary_admin' || payload.role === 'secondary_admin' || payload.role === 'teacher') &&
      typeof payload.schoolSubdomain === 'string' &&
      typeof payload.fullName === 'string'
    ) {
      return {
        userId: payload.userId,
        role: payload.role,
        schoolSubdomain: payload.schoolSubdomain,
        fullName: payload.fullName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export type PendingTwoFactorPayload = {
  userId: string;
  schoolSubdomain: string;
};

// A short-lived, narrowly-scoped token issued after a correct password but
// before the TOTP code is verified. Deliberately a different shape (no
// role/fullName, a "purpose" tag) from SessionPayload so it can never be
// mistaken for -- or replayed as -- a real session, even if it leaked.
export async function signPendingTwoFactorToken(payload: PendingTwoFactorPayload): Promise<string> {
  return new SignJWT({ ...payload, purpose: '2fa-pending' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getSecretKey());
}

export async function verifyPendingTwoFactorToken(token: string): Promise<PendingTwoFactorPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose === '2fa-pending' && typeof payload.userId === 'string' && typeof payload.schoolSubdomain === 'string') {
      return { userId: payload.userId, schoolSubdomain: payload.schoolSubdomain };
    }
    return null;
  } catch {
    return null;
  }
}

export async function signOwnerSession(): Promise<string> {
  return new SignJWT({ owner: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifyOwnerSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.owner === true;
  } catch {
    return false;
  }
}

/**
 * Gate for school-scoped staff API routes: requires a valid session cookie
 * whose role is in `allowedRoles` AND whose schoolSubdomain claim matches
 * the school resolved from this request's Host header (blocks a session
 * issued for one school from being used against another's API, the same
 * cross-tenant check middleware.ts already does for page routes).
 *
 * Route handlers under app/api/** are not covered by middleware.ts's
 * matcher (it only guards /admin, /teacher-dashboard, /platform page
 * routes), so each staff-only API route must call this itself rather than
 * relying on the page-level redirect.
 */
export async function requireSchoolSession(
  request: NextRequest,
  allowedRoles: Array<'admin' | 'primary_admin' | 'secondary_admin' | 'teacher'>
): Promise<{ school: School; session: SessionPayload } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session || !allowedRoles.includes(session.role)) return null;

  const school = await getSchoolFromHost(request.headers.get('host'));
  if (!school || school.subdomain !== session.schoolSubdomain) return null;

  return { school, session };
}
