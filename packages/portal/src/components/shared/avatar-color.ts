/**
 * Avatar color utility
 * Deterministic color assignment based on id hash.
 */

/** Color block palette — solid opaque background + contrasting text color */
export const PALETTE = [
  { bg: '#dc2626', text: '#ffffff' }, // Red
  { bg: '#2563eb', text: '#ffffff' }, // Blue
  { bg: '#eab308', text: '#1a1a1a' }, // Yellow (dark text)
  { bg: '#16a34a', text: '#ffffff' }, // Green
  { bg: '#8b5cf6', text: '#ffffff' }, // Purple
] as const;

/** Deterministic hash based on id */
export function hashId(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Get avatar background color based on id */
export function getAvatarColor(id: string): { bg: string; text: string } {
  const h = hashId(id);
  return PALETTE[h % PALETTE.length];
}

/** Get first letter (uppercase) from name */
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
