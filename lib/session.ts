import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'session';
export const PLATFORM_SESSION_COOKIE = 'platform_session';

export type SessionPayload = {
  userId: string;
  role: 'admin' | 'teacher';
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
      (payload.role === 'admin' || payload.role === 'teacher') &&
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
