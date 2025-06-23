/**
 * Extracts the Common Name (CN) from an X.509 identity string.
 * @param x509Identity The X.509 identity string.
 * @returns The extracted user ID or null if not found.
 */
export function extractUserId(x509Identity: string): string | null {
  if (!x509Identity) {
    return null;
  }
  const match = x509Identity.match(/CN=([^,]+)/);
  return match ? match[1] : null;
}
