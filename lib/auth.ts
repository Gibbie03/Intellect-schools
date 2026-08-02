import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export {
  SESSION_COOKIE,
  PLATFORM_SESSION_COOKIE,
  signSession,
  verifySession,
  signOwnerSession,
  verifyOwnerSession,
  requireSchoolSession,
} from './session';
export type { SessionPayload } from './session';
