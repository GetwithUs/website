/**
 * Server-only helpers for client image storage. The database keeps URLs;
 * Blob keeps bytes. Rejecting foreign URLs prevents the admin from pointing
 * a client at an arbitrary remote image.
 */
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

export function isClientBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && BLOB_HOST.test(parsed.hostname);
  } catch {
    return false;
  }
}

function clientFilePath(url: string): string | null {
  if (!isClientBlobUrl(url)) return null;
  const parsed = new URL(url);
  const path = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  return path.startsWith("clients/") ? path : null;
}

/** Best-effort cleanup: a missing/foreign file must never block a client write. */
export async function deleteClientImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = clientFilePath(url);
  if (!path) return;
  const { del } = await import("@vercel/blob");
  await del(path).catch(() => undefined);
}
