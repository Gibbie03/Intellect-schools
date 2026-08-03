const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Used when interpolating values into raw HTML strings handed to
// document.write() for print/download popups -- values like a student's
// name, a subject, or a report-card comment are staff/parent-entered data,
// not literal template text, so they need escaping to avoid stored XSS.
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}
