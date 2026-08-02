import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/**
 * Validation only depends on (secret, time, algorithm, digits, period) --
 * issuer/label are purely cosmetic metadata for the authenticator app's
 * display, so they're not needed here, only when building the QR code.
 *
 * FIX NOTE: this used to just return whether the code matched *some* step
 * in the +/-1 window, with nothing tracking which step had already been
 * used -- so a valid code stayed accepted for its entire ~90s window no
 * matter how many times it was submitted. A code intercepted once (a
 * phished login page relaying it, a shoulder-surfed screen, a compromised
 * network) could be replayed against a fresh login attempt within that
 * window, defeating the point of a second factor. `lastUsedStep` (persisted
 * per-account in school_users.totp_last_used_step) closes that: a code is
 * only accepted if its step is strictly newer than the last one accepted --
 * safe to reject on ties/replays since time only moves forward, so a
 * legitimate later code always lands on a later step.
 */
export function verifyTotpCode(
  secretBase32: string,
  token: string,
  lastUsedStep?: number | null
): { valid: boolean; step: number | null } {
  const totp = new TOTP({ secret: Secret.fromBase32(secretBase32) });
  // window: 1 tolerates the previous/next 30s step, covering minor clock drift.
  const delta = totp.validate({ token: token.replace(/\s+/g, ''), window: 1 });
  if (delta === null) return { valid: false, step: null };

  const step = totp.counter() + delta;
  if (lastUsedStep != null && step <= lastUsedStep) {
    return { valid: false, step: null };
  }
  return { valid: true, step };
}

export async function buildTotpQrCode(secretBase32: string, issuer: string, label: string): Promise<string> {
  const totp = new TOTP({ issuer, label, secret: Secret.fromBase32(secretBase32) });
  return QRCode.toDataURL(totp.toString());
}
