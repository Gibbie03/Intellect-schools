import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/**
 * Validation only depends on (secret, time, algorithm, digits, period) --
 * issuer/label are purely cosmetic metadata for the authenticator app's
 * display, so they're not needed here, only when building the QR code.
 */
export function verifyTotpCode(secretBase32: string, token: string): boolean {
  const totp = new TOTP({ secret: Secret.fromBase32(secretBase32) });
  // window: 1 tolerates the previous/next 30s step, covering minor clock drift.
  return totp.validate({ token: token.replace(/\s+/g, ''), window: 1 }) !== null;
}

export async function buildTotpQrCode(secretBase32: string, issuer: string, label: string): Promise<string> {
  const totp = new TOTP({ issuer, label, secret: Secret.fromBase32(secretBase32) });
  return QRCode.toDataURL(totp.toString());
}
