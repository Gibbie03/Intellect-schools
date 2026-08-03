// A client can set the multipart Content-Type of a file part to whatever it
// likes, so file.type is not proof of what the bytes actually are -- a
// startsWith('image/') check alone lets someone upload e.g. an
// 'image/svg+xml' file (SVG can embed <script>, which runs if the stored
// object's public URL is opened directly) or any other type as long as it
// starts with "image/". Restrict to a fixed allowlist of raster formats and
// derive the storage extension from that allowlist rather than from the
// attacker-controlled filename.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type ImageValidation = { ok: true; extension: string } | { ok: false; error: string };

export function validateImageUpload(file: File): ImageValidation {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: 'Only JPEG, PNG, WEBP, or GIF images are allowed.' };
  }
  return { ok: true, extension };
}
