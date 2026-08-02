/**
 * Builds a "click to chat" WhatsApp deep link with a pre-filled message.
 * Nothing is sent automatically -- staff still click the link themselves --
 * so this needs no paid SMS/WhatsApp Business API account.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
